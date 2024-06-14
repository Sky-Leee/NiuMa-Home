package logic

import (
	"niumahome/dao/mysql"
	niumahome "niumahome/errors"
	"niumahome/models"

	"github.com/pkg/errors"
	"gorm.io/gorm"
)

// 返回社区列表（不包含 intro）
func GetCommunityList() ([]models.CommunityDTO, error) {
	list, err := mysql.SelectCommunityList()
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		err = nil
	}

	return list, err
}

// 根据 ID 查询某个社区的 detail
func GetCommunityDetailByID(id int64) (*models.CommunityDTO, error) {
	detail, err := mysql.SelectCommunityDetailByID(id)
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		err = niumahome.ErrNoSuchCommunity
	}

	return detail, err
}