<template>
    <footer class="lake-footer">
        <div class="footer-content">
            <p class="icp-info">
                <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="icp-link">
                    蜀ICP备2024053778号-1
                </a>
            </p>
            <p class="public-security-info">
                <img src="/beian.png" alt="公安部门图标">
                <a href="https://beian.mps.gov.cn/#/query/webSearch?code=51142102511594" target="_blank"
                    rel="noopener noreferrer" class="public-security-link">
                    川公网安备51142102511594号
                </a>
            </p>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'Footer',
    data() {
        return {
            isAtBottom: false,  // 页面底部标记
        }
    },
    mounted() {
        window.addEventListener('scroll', this.checkBottom);
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.checkBottom);
    },
    methods: {
        checkBottom() {
            const scrollY = window.scrollY;
            const visibleHeight = document.documentElement.clientHeight;
            const pageHeight = document.documentElement.scrollHeight;
            const bottomOfWindow = visibleHeight + scrollY >= pageHeight;

            this.isAtBottom = bottomOfWindow;

            if (this.isAtBottom) {
                this.$el.classList.remove('hide-footer');
            } else {
                this.$el.classList.add('hide-footer');
            }
        },
    }
}
</script>

<style lang="less" scoped>
.lake-footer {
    transition: transform 0.3s ease-in-out; // 添加过渡动画效果
    transform: translateY(100%); // 默认隐藏footer

    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3rem;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: 1rem 0;
    background-color: #fff;
    border-top: 1px solid #eaeaea;
    color: #666;

    .container {
        display: flex;
        align-items: center;
    }

    .icp-info,
    .public-security-info {
        margin: 0.5rem 0;
        font-size: 0.8rem;
        text-align: center;

        img {
            max-width: 7%;
            /* 限制图片的最大宽度，保持图片比例 */
            height: auto;
        }
    }

    .icp-link,
    .public-security-link {
        color: inherit;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
}

.lake-footer:not(.hide-footer) {
    transform: translateY(0%); // 显示footer
}

@media screen and (max-width: 480px) {
    .lake-footer {
        justify-content: space-around;
        flex-direction: column;
        height: auto;
        padding: 1rem 0;

        .icp-info,
        .public-security-info {
            margin: 0.5rem 0;
        }
    }
}
</style>