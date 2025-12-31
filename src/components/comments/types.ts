
import { Post as PrismaPost, Comment as PrismaComment, User } from '@prisma/client';

export type UserProfile = Pick<User, 'id' | 'displayName' | 'username' | 'avatar' | 'role'>;

export interface CommentWithUser extends Omit<PrismaComment, 'user'> {
    user: UserProfile;
    likeCount: number;
    isLikedByCurrentUser: boolean;
}

export interface PostWithUser extends Omit<PrismaPost, 'user' | 'comments'> {
    user: UserProfile;
    comments: CommentWithUser[];
    likeCount: number;
    isLikedByCurrentUser: boolean;
}
