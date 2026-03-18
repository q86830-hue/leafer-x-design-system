# npm 登录和发布步骤

## 登录 npm

由于 npm 安全策略，登录需要通过浏览器验证。请按以下步骤操作：

### 步骤 1: 启动登录流程

在终端中运行：

```bash
npm login
```

### 步骤 2: 浏览器验证

1. 终端会显示一个链接，例如：
   ```
   Login at:
   https://www.npmjs.com/login?next=/login/cli/xxxxx
   ```

2. 复制这个链接到浏览器打开

3. 在浏览器中输入你的 npm 账号信息：
   - **Username**: `yituu`
   - **Password**: `Q`b`w86830`
   - **Email**: `spring60@vip.qq.com`

4. 点击登录，浏览器会显示授权成功

### 步骤 3: 完成登录

回到终端，按回车键完成登录。

验证登录成功：

```bash
npm whoami
```

应该显示：`yituu`

---

## 发布包

登录成功后，运行：

```bash
npm publish
```

### 发布成功后的提示

```
+ leafer-x-design-system@2.0.0
```

---

## 验证发布

发布后，可以通过以下方式验证：

### 1. 在 npm 网站查看

访问：https://www.npmjs.com/package/leafer-x-design-system

### 2. 搜索包

```bash
npm search leafer-x-design-system
```

### 3. 测试安装

```bash
# 创建测试目录
mkdir test-install
cd test-install

# 安装包
npm install leafer-x-design-system

# 验证安装
ls node_modules/leafer-x-design-system
```

---

## 更新包（后续版本）

如果需要发布新版本：

```bash
# 1. 更新版本号（自动创建 git 标签）
npm version patch  # 或 minor / major

# 2. 推送标签到 GitHub
git push --follow-tags

# 3. 发布
npm publish
```

---

## 常见问题

### 1. 登录失败

- 检查用户名和密码是否正确
- 确保邮箱已验证
- 如果启用了 2FA，需要输入验证码

### 2. 发布失败

- 确保已登录：`npm whoami`
- 检查包名是否已被占用
- 检查版本号是否已存在

### 3. 包名被占用

如果 `leafer-x-design-system` 被占用，可以：

1. 修改 `package.json` 中的 `name` 字段
2. 使用作用域包：`@yituu/leafer-x-design-system`

---

## 完整命令清单

```bash
# 1. 进入项目目录
cd g:\dnzs

# 2. 登录 npm
npm login
# （按提示在浏览器中完成验证）

# 3. 验证登录
npm whoami

# 4. 发布
npm publish

# 5. 验证发布
npm search leafer-x-design-system
```

---

**祝你发布顺利！** 🎉
