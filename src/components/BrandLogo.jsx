/** Shared brand mark from /public/logo.png */
export default function BrandLogo({ size = 36, className = '' }) {
  return (
    <img
      src="/logo.png"
      alt="VCL4X"
      width={size}
      height={size}
      className={`brand-logo ${className}`.trim()}
      decoding="async"
    />
  );
}
