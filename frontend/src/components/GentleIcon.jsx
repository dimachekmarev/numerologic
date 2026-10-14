export default function GentleIcon({ name = "flower", size = 28 }) {
  const paths = {
    flower:
      "M12 12c-7-2-8-8-4-9 3-1 5 3 4 9Zm0 0c2-7 8-8 9-4 1 3-3 5-9 4Zm0 0c7 2 8 8 4 9-3 1-5-3-4-9Zm0 0c-2 7-8 8-9 4-1-3 3-5 9-4Z",
    heart: "M12 20S3 15 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Z",
    journal:
      "M5 3h13a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5V3Zm3 0v18M11 8h5M11 12h5M11 16h3",
    sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
    leaf: "M5 20C4 8 12 3 21 3c0 9-5 17-16 17Zm0 0L16 8M11 14v-5M11 14h5",
    moon: "M20 15a9 9 0 0 1-11-11A9 9 0 1 0 20 15Z",
    arrow: "M4 12h16m-6-6 6 6-6 6",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={paths[name] || paths.flower}
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
