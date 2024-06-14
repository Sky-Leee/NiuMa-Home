package router

import (
	"fmt"
	"net/http"
	"niumahome/controller"
	docs "niumahome/docs"
	"niumahome/logger"
	"niumahome/middleware"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

var router *gin.Engine

func Init() {
	if !viper.GetBool("server.develop_mode") {
		gin.SetMode(gin.ReleaseMode)
	}

	router = gin.New()
	frontendPath := viper.GetString("CORF.frontend_path")
	router.Use(logger.GinLogger(), logger.GinRecovery(true), middleware.RateLimit(0.6, 5000), middleware.CORF(frontendPath)) // 全局限流

	/* Swagger 接口文档 */
	if viper.GetBool("service.swagger.enable") {
		docs.SwaggerInfo.BasePath = "/api/v1"
		router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))
	}

	v1 := router.Group("/api/v1")

	/* RefreshToken */
	v1.GET("/token/refresh/", controller.RefreshTokenHandler)

	/* User */
	usrGrp := v1.Group("/user")
	usrGrp.POST("/register", controller.UserRegisterHandler)
	usrGrp.POST("/login", controller.UserLoginHandler)

	/* Community */
	communityGrp := v1.Group("/community")
	communityGrp.Use(middleware.Auth(), middleware.VerifyToken())
	communityGrp.GET("/list", controller.CommunityListHandler)
	communityGrp.GET("/detail", controller.CommunityDetailHandler)

	/* Post */
	postGrp := v1.Group("/post")
	postGrp.Use(middleware.Auth(), middleware.VerifyToken())
	postGrp.POST("/create", controller.CreatePostHandler)
	postGrp.GET("/:post_id", controller.PostDetailHandler)
	postGrp.POST("/vote", controller.PostVoteHandler)

	v1.GET("/post/list", controller.PostListHandler)     // 查看列表
	v1.GET("/post/search", controller.PostSearchHandler) // 搜索不需要登录也可以使用

}

func GetServer() *http.Server {
	return &http.Server{
		Addr:    fmt.Sprintf("%s:%d", viper.GetString("server.ip"), viper.GetInt("server.port")),
		Handler: router,
	}
}