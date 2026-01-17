'use server';

import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
    const success = await login(formData);
    if (success) {
        redirect('/products');
    } else {
        return { error: 'Invalid login or password' };
    }
}
