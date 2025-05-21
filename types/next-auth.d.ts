import 'next-auth';

declare module 'next-auth' {
  interface User {
    username?: string;
  }
  interface Session {
    user: {
      username?: string;
      id?: string;
    } & DEfaultSession['user'];
  }
}
declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
    username: string;
    // Add any other token properties you need
  }
}
