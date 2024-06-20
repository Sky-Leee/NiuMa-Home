package rebuild

import (
	"niumahome/dao/localcache"
	"niumahome/dao/mysql"
	"niumahome/dao/redis"
	"niumahome/models"

	"github.com/pkg/errors"
	"github.com/spf13/viper"
)

func RebuildPostHotList() ([]*models.PostDTO, error) {
	size := viper.GetInt64("service.hot_post_list.size")
	postIDs, _, err := redis.GetPostIDs(1, size, "score")
	if err != nil && !errors.Is(err, redis.Nil) {
		return nil, errors.Wrap(err, "logic:GetHotPostList: GetPostIDs")
	}

	hotPosts, err := mysql.SelectPostListByPostIDs(postIDs)
	if err != nil {
		return nil, errors.Wrap(err, "logic:GetHotPostList: GetPostListByIDs")
	}
	localcache.GetLocalCache().Set("hotposts", hotPosts) // 写本地缓存
	return hotPosts, nil
}
