import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Views
import LandingView from '../views/LandingView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import OtpView from '../views/OtpView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'landing',
            component: LandingView,
            meta: { guestOnly: true }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { guestOnly: true }
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterView,
            meta: { guestOnly: true }
        },
        {
            path: '/verify-otp',
            name: 'verify-otp',
            component: OtpView,
            meta: { requiresOtp: true }
        },

        // --- 🛡️ ROLE-SPECIFIC DASHBOARDS ---
        {
            path: '/admin',
            name: 'admin-dashboard',
            component: () => import('../views/admin/AdminDashboard.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/manager',
            name: 'manager-dashboard',
            component: () => import('../views/manager/ManagerDashboard.vue'),
            meta: { requiresAuth: true, role: 'org_manager' }
        },
        {
            path: '/doctor',
            name: 'doctor-dashboard',
            component: () => import('../views/doctor/DoctorDashboard.vue'),
            meta: { requiresAuth: true, role: 'doctor' }
        },
        {
            path: '/instructor',
            name: 'instructor-dashboard',
            component: () => import('../views/instructor/InstructorDashboard.vue'),
            meta: { requiresAuth: true, role: 'instructor' }
        },

        // --- 404 CATCH-ALL ---
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            redirect: to => {
                const authStore = useAuthStore();
                return authStore.isAuthenticated ? getRoleHome(authStore.userRole) : { name: 'landing' };
            }
        }
    ]
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // 1. Ensure user state is loaded
    if (!authStore.isInitialized) {
        await authStore.fetchUser();
    }

    const isAuthenticated = authStore.isAuthenticated;

    // 2. Redirect authenticated users away from Guest/OTP pages
    if (isAuthenticated && (to.meta.guestOnly || to.meta.requiresOtp)) {
        return next(getRoleHome(authStore.userRole));
    }

    // 3. Protected Route Logic
    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            return next({ name: 'login' });
        }

        // Role Authorization
        if (to.meta.role && to.meta.role !== authStore.userRole) {
            return next(getRoleHome(authStore.userRole));
        }
    }

    next();
});

function getRoleHome(role) {
    switch (role) {
        case 'admin': return { name: 'admin-dashboard' };
        case 'org_manager': return { name: 'manager-dashboard' };
        case 'doctor': return { name: 'doctor-dashboard' };
        case 'instructor': return { name: 'instructor-dashboard' };
        default: return { name: 'landing' };
    }
}

// 🚀 Preline UI Re-initialization Hook (Must fire on route change)
router.afterEach((to, from, failure) => {
    if (!failure) {
        setTimeout(() => {
            if (window.HSStaticMethods) {
                window.HSStaticMethods.autoInit();
            }
        }, 100);
    }
});

export default router;