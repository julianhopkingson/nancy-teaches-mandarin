import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: string;
            image?: string | null;
        } & DefaultSession['user'];
        displayName?: string;
        avatar?: string;
    }

    interface User {
        id: string;
        role: string;
        avatar?: string;
        displayName?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        picture?: string | null;
    }
}
