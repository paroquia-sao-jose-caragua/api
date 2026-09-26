import { Hono } from 'hono';
import { authenticate } from './authenticate';
import { refresh } from './refresh';
import { forgotPassword } from './forgot-password';
import { resetPassword } from './reset-password';
import { changePassword } from './change-password';
import { listUsers } from './list-users';
import { getUser } from './get-user';
import { createUser } from './create-user';
import { updateUserRole } from './update-user-role';
import { updateUserStatus } from './update-user-status';
import { revokeSessions } from './revoke-sessions';
import { adminResetPassword } from './admin-reset-password';
import { resendUserInvite } from './resend-user-invite';
import { verifyToken } from '@/http/middlewares/verifyToken';
import { verifyUserRole } from '@/http/middlewares/verifyUserRole';

const app = new Hono();

// Rotas públicas de autenticação e recuperação
app.post('/sessions', authenticate);
app.post('/token/refresh', refresh);
app.post('/forgot-password', forgotPassword);
app.post('/reset-password', resetPassword);

// Alteração da própria senha (qualquer usuário autenticado)
app.patch('/users/me/password', verifyToken, changePassword);

// Rotas administrativas (apenas admin)
app.get('/users', verifyToken, verifyUserRole('admin'), listUsers);
app.get('/users/:id', verifyToken, verifyUserRole('admin'), getUser);
app.post('/users', verifyToken, verifyUserRole('admin'), createUser);
app.patch('/users/:id/role', verifyToken, verifyUserRole('admin'), updateUserRole);
app.patch('/users/:id/status', verifyToken, verifyUserRole('admin'), updateUserStatus);
app.post('/users/:id/revoke-sessions', verifyToken, verifyUserRole('admin'), revokeSessions);
app.post('/users/:id/reset-password', verifyToken, verifyUserRole('admin'), adminResetPassword);
app.post('/users/:id/resend-invite', verifyToken, verifyUserRole('admin'), resendUserInvite);

export { app as userRoutes };
