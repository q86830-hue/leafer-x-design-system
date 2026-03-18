# GitHub 仓库设置指南

## 第一步：在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `leafer-x-design-system`
   - **Description**: `基于 LeaferJS 的高保真 UI 设计系统生成器 - 支持响应式设计、暗黑模式、丰富的组件库`
   - **Visibility**: Public (推荐，让更多人看到)
   - **Initialize this repository with**: 不要勾选任何选项

3. 点击 **Create repository**

## 第二步：推送本地代码

创建仓库后，GitHub 会显示推送命令。在本地运行：

```bash
# 添加远程仓库
git remote add origin https://github.com/你的用户名/leafer-x-design-system.git

# 推送代码
git branch -M main
git push -u origin main
```

## 第三步：验证推送

访问 `https://github.com/你的用户名/leafer-x-design-system` 查看代码是否成功推送。

## 可选：创建 GitHub Token

如果你使用 HTTPS 推送时需要身份验证，可以创建 Personal Access Token：

1. 访问 https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. 选择权限：`repo` (完整仓库访问)
4. 生成后复制 token
5. 推送时使用 token 作为密码

## 本地已完成的操作

✅ Git 仓库初始化
✅ .gitignore 配置
✅ LICENSE 文件 (MIT)
✅ 所有代码文件提交
✅ 提交信息：feat: initial release of leafer-x-design-system

## 提交统计

- **文件数**: 36 个
- **代码行数**: 8901 行
- **提交哈希**: ba12f64

---

**下一步**: 请在 GitHub 上创建仓库，然后运行上面的推送命令！
