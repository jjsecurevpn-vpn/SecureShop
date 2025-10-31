### Pasos para Deploy

1. **Build del Backend**:

   ```bash
   cd backend
   npm run build
   ```

2. **Build del Frontend**:

   ```bash
   cd ../frontend
   npm run build
   ```

3. **Subir Backend Dist**:

   ```bash
   scp -r ./backend/dist root@149.50.148.6:/home/secureshop/secureshop-vpn/backend/
   ```

4. **Subir Frontend Dist**:
   ```bash
   scp -r ./frontend/dist root@149.50.148.6:/home/secureshop/secureshop-vpn/frontend/
   ```

### Reinicio en VPS

Después de subir los dists, conectar por SSH y reiniciar servicios:

```bash
ssh root@149.50.148.6
cd /home/secureshop/secureshop-vpn
pm2 restart all
```
