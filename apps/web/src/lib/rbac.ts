export const hasRole = (user: any, roles: string[]) =>{
    return user && roles.includes(user.role);
}