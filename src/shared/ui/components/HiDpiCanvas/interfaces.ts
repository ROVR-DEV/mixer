export interface HighDpiCanvasProps extends React.ComponentProps<'canvas'> {
  onHiDpiCtxCreate?: (ctx: CanvasRenderingContext2D | null) => void;
  useHiDpi?: boolean;
}
