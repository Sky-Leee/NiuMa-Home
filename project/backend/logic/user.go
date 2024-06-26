package logic

import (
	"niumahome/dao/mysql"
	"niumahome/dao/redis"
	"niumahome/internal/utils"
	"niumahome/models"

	niumahome "niumahome/errors"

	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func UserRegist(usr *models.User) (string, string, error) {
	// 查询用户名是否存在
	exist, _, err := checkUserIfExist(usr.UserName, true)
	if err != nil {
		return "", "", errors.Wrap(err, "logic:UserLogin: checkUserIfExist")
	}
	if exist {
		return "", "", niumahome.ErrUserExist
	}
	// 查询邮箱是否存在
	exist, _, err = checkUserIfExist(usr.Email, false)
	if err != nil {
		return "", "", errors.Wrap(err, "logic:UserLogin: checkUserIfExist")
	}
	if exist {
		return "", "", niumahome.ErrEmailExist
	}

	// 不存在，新建用户
	// 加密
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(usr.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", "", errors.Wrap(err, "logic:UserLogin: GenerateFromPassword")
	}
	usr.Password = string(hashedPassword)

	// 创建 user_id
	usr.UserID = utils.GenSnowflakeID()

	// 持久化
	if err := mysql.InsertUser(usr); err != nil {
		return "", "", errors.Wrap(err, "logic:UserLogin: InsertUser")
	}

	return genTokenHelper(usr.UserID)
}

func UserLogin(params *models.ParamUserLogin) (*models.User, string, string, error) {
	// 判断用户是否存在
	exist, _, err := checkUserIfExist(params.Username, true)
	if err != nil {
		return nil, "", "", errors.Wrap(err, "logic:UserLogin: checkUserIfExist")
	}
	if !exist {
		return nil, "", "", niumahome.ErrUserNotExist
	}

	// 查询、解析密码
	_usr, err := mysql.SelectUserByName(params.Username)
	if err != nil {
		return nil, "", "", err
	}

	// 验证密码一致性
	if err := bcrypt.CompareHashAndPassword([]byte(_usr.Password), []byte(params.Password)); err != nil {
		return nil, "", "", niumahome.ErrWrongPassword
	}

	access_token, refresh_token, err := genTokenHelper(_usr.UserID)
	return _usr, access_token, refresh_token, errors.Wrap(err, "logic:UserLogin: genTokenHelper")
}

func UserUpdate(userID int64, params models.ParamUserUpdate) error {
	exist, _userID, err := checkUserIfExist(params.Username, true)
	if err != nil {
		return errors.Wrap(err, "logic:UserUpdate: CheckUserIfExist")
	}
	if exist && userID != _userID {
		return niumahome.ErrUserExist
	}

	err = mysql.UpdateUserInfo(userID, params)
	return errors.Wrap(err, "logic:UserUpdate: UpdateUserInfo")
}

func UserGetInfo(userID int64) (*models.UserDTO, error) {
	user, err := mysql.SelectUserByUserID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, niumahome.ErrUserNotExist
		}
		return nil, errors.Wrap(err, "logic:UserGetInfo: SelectUserByUserID")
	}

	return &models.UserDTO{
		UserID:   userID,
		UserName: user.UserName,
		Email:    user.Email,
		Gender:   user.Gender,
		Avatar:   user.Avatar,
		Intro:    user.Intro,
	}, nil
}

// 刷新 access_token、refresh_token 并返回
func genTokenHelper(UserID int64) (string, string, error) {
	// 生成 access_token
	access_token, err0 := utils.GenToken(UserID, utils.AccessType)
	refresh_token, err1 := utils.GenToken(0, utils.RefreshType)
	if err0 != nil || err1 != nil {
		return "", "", niumahome.ErrGenToken
	}

	// 刷新 redis 中的 access_token
	// 刷新 redis 中的 refresh_token
	if err := redis.SetUserAccessToken(UserID, access_token, utils.GetAccessTokenExpireDuration()); err != nil {
		return "", "", err
	}
	if err := redis.SetUserRefreshToken(UserID, refresh_token, utils.GetRefreshTokenExpireDuration()); err != nil {
		return "", "", err
	}

	return access_token, refresh_token, nil
}

// 判断用户是否存在
func checkUserIfExist(param string, isUserName bool) (bool, int64, error) {
	var usr *models.User
	var err error

	if isUserName {
		usr, err = mysql.SelectUserByName(param)
	} else {
		usr, err = mysql.SelectUserByEmail(param)
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, 0, nil // 不存在
		}
		return false, 0, errors.Wrap(err, "logic:checkUserIfExist: SelectUserByName") // 发生其它错误
	}
	return true, usr.UserID, nil // 存在
}
