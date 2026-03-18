# GitHub 推送命令

## 推送步骤

在你的本地终端中依次执行以下命令：

```bash
# 1. 进入项目目录
cd g:\dnzs

# 2. 检查远程仓库地址
git remote -v

# 3. 设置远程仓库地址（如果不对的话）
git remote set-url origin https://github.com/q86830-hue/leafer-x-design-system.git

# 4. 切换到 main 分支
git branch -M main

# 5. 推送到 GitHub
git push -u origin main
```

## 如果遇到身份验证问题

### 方法一：使用 GitHub Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：`repo` (完整仓库访问)
4. 生成 Token 后复制

推送时使用 Token 作为密码：
```bash
git push -u origin main
# 用户名：你的 GitHub 用户名
# 密码：粘贴刚才生成的 Token
```

### 方法二：使用 SSH

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加密钥到 ssh-agent
ssh-add ~/.ssh/id_ed25519

# 复制公钥到 GitHub
cat ~/.ssh/id_ed25519.pub
# 然后访问 https://github.com/settings/keys 添加

# 修改远程地址为 SSH
git remote set-url origin git@github.com:q86830-hue/leafer-x-design-system.git

# 推送
git push -u origin main
```

## 验证推送

推送成功后，访问：
https://github.com/q86830-hue/leafer-x-design-system

查看代码是否已成功上传。

## 当前状态

- ✅ Git 仓库已初始化
- ✅ 所有文件已提交 (37 个文件, 8900+ 行代码)
- ✅ 提交信息已完善
- ⏳ 等待推送到 GitHub

---

**提示**：如果网络不稳定，可以尝试使用手机热点或者稍后再试。
