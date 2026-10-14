export default function BrandMark({
  size = 38,
  className = "",
  decorative = false,
}) {
  return (
    <img
      className={`numerologic-brand-mark ${className}`.trim()}
      src={`${import.meta.env.BASE_URL}numerologic-mark.svg`}
      alt={decorative ? "" : "Numerologic"}
      width={size}
      height={size}
      decoding="async"
      draggable={false}
    />
  );
}
