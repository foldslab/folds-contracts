# Folds Finance

Folds are custom yield farming strategies that enable users to earn from multiple incentive mechanisms simultaneously.

## Deploy

0. Install packages
```
npm install
```

1. Copy setting file
```
cp secret.json.example secret.json
```

2. Add priviate key
Replace `xxx` in secret.json with private key, it's the deployment + governance address

3. Deploy
```
yarn deploy:heco
```
