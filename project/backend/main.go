package main

import (
	"context"
	"flag"
	"net/http"
	"niumahome/dao/bleve"
	"niumahome/dao/elasticsearch"
	"niumahome/dao/email"
	"niumahome/dao/kafka"
	"niumahome/dao/localcache"
	"niumahome/dao/mysql"
	"niumahome/dao/qiniu"
	"niumahome/dao/redis"
	"niumahome/internal/utils"
	"niumahome/logger"
	"niumahome/router"
	"niumahome/settings"
	"niumahome/workers"
	"os"
	"os/signal"
	"time"

	"github.com/spf13/viper"
)

func init() {
	path := flag.String("c", "./config/config.json", "config path(file must be named 'config.json')")
	flag.Parse()

	settings.InitSettings(*path)

	logger.InitLogger()

	utils.InitSnowflake()
	utils.InitTrans()
	utils.InitToken()

	mysql.InitMySQL()
	logger.Infof("Initializing MySQL successfully")

	redis.InitRedis()
	logger.Infof("Initializing Redis successfully")

	if viper.GetBool("elasticsearch.enable") {
		elasticsearch.Init()
		logger.Infof("Initializing Elasticsearch successfully")
	}
	if viper.GetBool("bleve.enable") {
		bleve.InitBleve()
		logger.Infof("Initializing Bleve successfully")
	}

	kafka.InitKafka()
	logger.Infof("Initializing Kafka successfully")

	localcache.InitLocalCache()
	logger.Infof("Initializing Localcache successfully")

	qiniu.InitQiniuConfig()
	logger.Infof("Initializing Qiniu Config successfully")

	email.InitEmail()
	logger.Infof("Initializing Email Service successfully")

	router.Init()
	logger.Infof("Initializing router successfully")

	workers.InitWorkers() // 后台任务
}

//	@title			NiuMa-Home 接口文档
//	@version		1.0
//	@description	包含了 NiuMa-Home 项目提供的接口
//	@termsOfService	http://www.skylee.io/terms/

//	@contact.name	skylee
//	@contact.url	http://www.skylee.io/support
//	@contact.email	support@skylee.io

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

// @host		127.0.0.1:1145
// @BasePath	/api/v1
func main() {
	srv := router.GetServer()

	idleConnsClosed := make(chan interface{})
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt)
		<-sigint // 阻塞，直到 SIGINT 信号产生

		// We received an interrupt signal, shut down.
		// Waits for clients that are still requesting, but will force exit after the specified time has elapsed.
		ctx, cancel := context.WithTimeout(context.Background(), time.Duration(viper.GetInt64("server.shutdown_waitting_time")))
		defer cancel()
		logger.Infof("Shutting down HTTP Server(wait for all connections to be closed)...")

		// Shutdown gracefully shuts down the server without interrupting any active connections.
		if err := srv.Shutdown(ctx); err != nil {
			// Error from closing listeners, or context timeout:
			logger.Errorf("NiuMa-Home server shutdown: %v", err)
		}
		logger.Infof("Http server closed successfully")
		close(idleConnsClosed)
	}()

	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		// Error starting or closing listener:
		logger.Errorf("HTTP server ListenAndServe: %v", err)
	}

	<-idleConnsClosed // 直到 close 后，主线程才会退出
	logger.Infof("Waitting for all background tasks to complete...")
	workers.Wait() // 等待所有后台任务结束才退出
	logger.Infof("Waitting for all kafka consumer to exit...")
	kafka.Wait() // 等待消费者全部退出
	logger.Infof("Done.\n\nniumahome server closed successfully")
}
