package redis

import (
	"context"
	"time"

	"github.com/pkg/errors"
	"github.com/redis/go-redis/v9"
)

// keys
// 规范：
// Key + KeyName + Type + (PF)前缀
const (
	// token
	KeyAccessTokenStringPF  = "niumahome:token:access_token:"  // parma: user_id, val: access_token
	KeyRefreshTokenStringPF = "niumahome:token:refresh_token:" // parma: user_id, val: refresh_token

	// post
	KeyPostTimeZset        = "niumahome:post:time"       // member: post_id, score: time
	KeyPostScoreZset       = "niumahome:post:score"      // member: post_id, score: score
	KeyPostCommunityZsetPF = "niumahome:post:community:" // member: post_id, score: 0
	KeyPostVotedZsetPF     = "niumahome:post:voted:"     // parma: post_id, member: user_id, score: opinion
	KeyCachePF             = "niumahome:cache:"

	// comment
	KeyCommentIndexZSetPF     = "niumahome:comment:index:"       // param:otype_oid, member:comment_id, score:floor
	KeyCommentContentStringPF = "niumahome:comment:content:"     // param:comment_id, value:content
	KeyCommentLikeStringPF    = "niumahome:comment:like:"        // param comment_id, member: count
	KeyCommentHateStringPF    = "niumahome:comment:hate:"        // param comment_id, member: count
	KeyCommentUserLikeIDsPF   = "niumahome:comment:userlikeids:" // param uid_oid_otype, member: comment_id
	KeyCommentUserHateIDsPF   = "niumahome:comment:userhateids:" // param uid_oid_otype, member: comment_id
	KeyCommentRemCidSet       = "niumahome:comment:rem:cid"      // member: comment_id

	// email
	KeyEmailVerificationCodeStringPF = "niumahome:email:verification:" // param: user_email, value: verification_code
)

var Nil = redis.Nil

// common method
func set(key string, val any, expireDuration time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()
	cmd := rdb.Set(ctx, key, val, expireDuration)
	return errors.Wrap(cmd.Err(), "")
}

func get(key string) *redis.StringCmd {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()
	return rdb.Get(ctx, key)
}

func Exists(key string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	cmd := rdb.Exists(ctx, key)
	return cmd.Val() == 1, errors.Wrap(cmd.Err(), "redis:Exists: Exists")
}

func ExistsKeys(keys []string) ([]bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	pipe := rdb.Pipeline()
	for _, key := range keys {
		pipe.Exists(ctx, key)
	}

	cmds, err := pipe.Exec(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "redis:ExistsKeys: Exists")
	}

	exists := make([]bool, len(cmds))
	for i := 0; i < len(cmds); i++ {
		cmd := cmds[i].(*redis.IntCmd)
		exists[i] = cmd.Val() == 1
	}

	return exists, nil
}

func GetKeysIdleTime(keys []string) ([]time.Duration, error) {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	pipe := rdb.Pipeline()
	for _, key := range keys {
		pipe.ObjectIdleTime(ctx, key)
	}
	cmds, err := pipe.Exec(ctx)
	if err != nil && !errors.Is(err, redis.Nil) {
		return nil, errors.Wrap(err, "redis:GetCommentLikeOrHateCountByCommentIDs: Get")
	}
	idleTimes := make([]time.Duration, len(keys))
	for i := 0; i < len(cmds); i++ {
		cmd := cmds[i].(*redis.DurationCmd)
		if errors.Is(cmd.Err(), redis.Nil) {
			idleTimes[i] = -1
		} else {
			idleTimes[i] = cmd.Val()
		}
	}
	return idleTimes, nil
}

func GetSetMembersByKey(key string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	cmd := rdb.SMembers(ctx, key)
	if cmd.Err() != nil && !errors.Is(cmd.Err(), redis.Nil) {
		return nil, errors.Wrap(cmd.Err(), "redis:GetSetMembersByKey: SMembers")
	}
	return cmd.Val(), nil
}

func SetIsMembers(key string, members []any) ([]bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	pipe := rdb.Pipeline()
	for _, member := range members {
		pipe.SIsMember(ctx, key, member)
	}

	cmds, err := pipe.Exec(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "redis:SetIsMembers: SIsMember")
	}
	res := make([]bool, 0, len(members))
	for _, cmd := range cmds {
		res = append(res, cmd.(*redis.BoolCmd).Val())
	}
	return res, nil
}

func GetKeys(pattern string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	cmd := rdb.Keys(ctx, pattern)
	if cmd.Err() != nil && !errors.Is(cmd.Err(), redis.Nil) {
		return nil, errors.Wrap(cmd.Err(), "redis:GetKeys: Keys")
	}

	return cmd.Val(), nil
}

func DelKeys(keys []string) error {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	cmd := rdb.Del(ctx, keys...)
	return errors.Wrap(cmd.Err(), "redis:DelKeys: Del")
}

func RestoreKeyExpireTime(key string, ttl time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	cmd := rdb.Expire(ctx, key, ttl)

	return errors.Wrap(cmd.Err(), "redis:RestoreKeyExpireTime: Expire")
}

// bool：是否创建了一个新的 member
func ZSetIncrBy(key, member string, offset float64) (bool, error) {
	if offset == 0 {
		return false, nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	cmd := rdb.ZIncrBy(ctx, key, offset, member)
	if cmd.Err() != nil {
		return false, errors.Wrap(cmd.Err(), "redis:IncrBy: IncrBy")
	}
	return cmd.Val() == offset, nil
}

func ZSetAdd(key, member string, score float64) error {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	cmd := rdb.ZAdd(ctx, key, redis.Z{
		Member: member,
		Score:  score,
	})

	return errors.Wrap(cmd.Err(), "redis:ZSetAdd: ZAdd")
}

func GetZSetMembersRangeByScore(key, min, max string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	cmd := rdb.ZRangeByScore(ctx, key, &redis.ZRangeBy{
		Min: min,
		Max: max,
	})

	return cmd.Val(), errors.Wrap(cmd.Err(), "redis:GetZSetMembersRangeByScore: ZRangeByScore")
}

func GetZSetMembersRangeByIndex(key string, start, end any, rev bool) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	cmd := rdb.ZRangeArgs(ctx, redis.ZRangeArgs{
		Key:   key,
		Start: start,
		Stop:  end,
		Rev:   rev,
	})

	return cmd.Val(), errors.Wrap(cmd.Err(), "redis:GetZSetMembersRangeByIndex: ZRangeByScore")
}

func ZSetRem(key string, member any) error {
	ctx, cancel := context.WithTimeout(context.Background(), redisTimeout)
	defer cancel()

	cmd := rdb.ZRem(ctx, key, member)

	return errors.Wrap(cmd.Err(), "redis:ZSetRem: ZRem")
}
