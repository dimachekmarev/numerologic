import { useI18n } from "../i18n";
import { Link } from "react-router-dom";
export default function StickyCTA({
  to = "/quiz",
  children = "Пройти мини-разбор",
}) {
  const { t: tr } = useI18n();
  return (
    <div className="sticky-cta">
      <Link className="primary-button" to={to}>
        {tr(children)}
      </Link>
    </div>
  );
}
