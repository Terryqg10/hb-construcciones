export interface ToolBrand {
  readonly name: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export const toolBrands: readonly ToolBrand[] = [
  { name: "Bosch", src: "/brands/bosch.svg", width: 433, height: 97 },
  { name: "Makita", src: "/brands/makita.svg", width: 815, height: 287 },
  { name: "DeWalt", src: "/brands/dewalt.svg", width: 957, height: 343 },
  { name: "Hilti", src: "/brands/hilti.svg", width: 284, height: 67 },
  { name: "Milwaukee", src: "/brands/milwaukee.svg", width: 957, height: 467 },
  { name: "Stanley", src: "/brands/stanley.svg", width: 200, height: 97 },
] as const;
