export interface Goal {
    id: number;
    title: string;
    duration: number; // in minutes
    completed: boolean;
}

export interface Post {
    id: number;
    goalId: number;
    content: string;
    imageUrl?: string; // optional
}