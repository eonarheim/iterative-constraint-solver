declare module dat {
    class GUI {
        constructor(options: { name: string });
        addFolder(name: string): GUI;
        add<T>(object: T, prop: keyof T, min?: number, max?: number, step?: number): any;
        addColor(object: any, prop: any): any;
    }
}

