'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPosts(lessonId: string) {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const posts = await prisma.post.findMany({
        where: { lessonId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    displayName: true,
                    username: true,
                    avatar: true,
                    role: true
                }
            },
            comments: {
                orderBy: { createdAt: 'asc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            displayName: true,
                            username: true,
                            avatar: true,
                            role: true
                        }
                    },
                    likes: true
                }
            },
            likes: true
        }
    });

    // Process posts to add isLikedByCurrentUser and likeCount
    return posts.map(post => ({
        ...post,
        likeCount: post.likes.length,
        isLikedByCurrentUser: currentUserId ? post.likes.some(like => like.userId === currentUserId) : false,
        comments: post.comments.map(comment => ({
            ...comment,
            likeCount: comment.likes.length,
            isLikedByCurrentUser: currentUserId ? comment.likes.some(like => like.userId === currentUserId) : false,
        }))
    }));
}

export async function createPost(lessonId: string, content: string, path: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const userExists = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!userExists) {
        throw new Error('User account not found. Please log out and log in again.');
    }

    await prisma.post.create({
        data: {
            content,
            userId: session.user.id,
            lessonId
        }
    });

    revalidatePath(path);
}

export async function createComment(postId: string, content: string, path: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const userExists = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!userExists) {
        throw new Error('User account not found. Please log out and log in again.');
    }

    await prisma.comment.create({
        data: {
            content,
            userId: session.user.id,
            postId
        }
    });

    revalidatePath(path);
}

export async function deletePost(postId: string, path: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    if (session.user.role !== 'admin' && post.userId !== session.user.id) {
        throw new Error('Forbidden');
    }

    await prisma.post.delete({ where: { id: postId } });
    revalidatePath(path);
}

export async function deleteComment(commentId: string, path: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error('Comment not found');

    if (session.user.role !== 'admin' && comment.userId !== session.user.id) {
        throw new Error('Forbidden');
    }

    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath(path);
}

export async function togglePostLike(postId: string, path: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
        throw new Error('User account not found. Please log out and log in again.');
    }

    const existingLike = await prisma.postLike.findUnique({
        where: {
            userId_postId: {
                userId,
                postId
            }
        }
    });

    if (existingLike) {
        await prisma.postLike.delete({
            where: { id: existingLike.id }
        });
    } else {
        await prisma.postLike.create({
            data: {
                userId,
                postId
            }
        });
    }

    revalidatePath(path);
}

export async function toggleCommentLike(commentId: string, path: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
        throw new Error('User account not found. Please log out and log in again.');
    }

    const existingLike = await prisma.commentLike.findUnique({
        where: {
            userId_commentId: {
                userId,
                commentId
            }
        }
    });

    if (existingLike) {
        await prisma.commentLike.delete({
            where: { id: existingLike.id }
        });
    } else {
        await prisma.commentLike.create({
            data: {
                userId,
                commentId
            }
        });
    }

    revalidatePath(path);
}
