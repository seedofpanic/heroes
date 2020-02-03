/// <reference types="next" />
/// <reference types="next/types/global" />
import 'react';

declare module 'react' {
    interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
        jsx?: boolean;
        global?: boolean;
    }
}