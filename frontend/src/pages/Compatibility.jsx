import { useI18n } from "../i18n";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import TrialAccess from "../components/TrialAccess";
export default function Compatibility() {
  const { t: tr } = useI18n();
  const navigate = useNavigate();
  const state = useLoad(api.dashboard);
  const [form, setForm] = useState({
    name_a: "",
    birth_date_a: "",
    name_b: "",
    birth_date_b: "",
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api.compatibilityPreview(form);
      setPreview(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  async function buy() {
    if (state.data?.club || state.data?.trial.active) {
      setLoading(true);
      try {
        await api.updateProfile({
          name: form.name_a,
          birth_date: form.birth_date_a,
          focus: "Отношения",
        });
        const r = await api.material("compatibility", {
          name: form.name_b,
          birth_date: form.birth_date_b,
          focus: "Отношения",
        });
        navigate("/report/" + r.id);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    localStorage.setItem("numerologic_checkout_product", "compatibility");
    localStorage.setItem(
      "numerologic_quiz",
      JSON.stringify({
        name: form.name_a,
        birth_date: form.birth_date_a,
        focus: "Отношения",
      }),
    );
    localStorage.setItem(
      "numerologic_partner",
      JSON.stringify({
        name: form.name_b,
        birth_date: form.birth_date_b,
      }),
    );
    navigate("/checkout?product=compatibility");
  }
  return (
    <section className="section-grid compatibility-page">
      <form className="soft-card form-grid" onSubmit={submit}>
        {tr(error && <p role="alert">{tr(error)}</p>)}
        <span className="eyebrow">
          {tr(
            "\u0414\u0438\u0430\u043B\u043E\u0433 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0441 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F",
          )}
        </span>
        <h1>
          {tr(
            "\u0421\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C \u043F\u0430\u0440\u044B",
          )}
        </h1>
        <input
          required
          maxLength={128}
          aria-label={tr("Ваше имя")}
          placeholder={tr("Ваше имя")}
          value={form.name_a}
          onChange={(e) =>
            setForm({
              ...form,
              name_a: e.target.value,
            })
          }
        />
        <input
          required
          aria-label={tr("Ваша дата рождения")}
          type="date"
          min="1900-01-01"
          max={localDay()}
          value={form.birth_date_a}
          onChange={(e) =>
            setForm({
              ...form,
              birth_date_a: e.target.value,
            })
          }
        />
        <input
          required
          maxLength={128}
          aria-label={tr("Имя партнёра")}
          placeholder={tr("Имя партнёра")}
          value={form.name_b}
          onChange={(e) =>
            setForm({
              ...form,
              name_b: e.target.value,
            })
          }
        />
        <input
          required
          aria-label={tr("Дата рождения партнёра")}
          type="date"
          min="1900-01-01"
          max={localDay()}
          value={form.birth_date_b}
          onChange={(e) =>
            setForm({
              ...form,
              birth_date_b: e.target.value,
            })
          }
        />
        <button className="primary-button" disabled={loading}>
          {tr(loading ? "Считаю..." : "Рассчитать карту пары")}
        </button>
      </form>
      <div className="soft-card locked-card">
        <TrialAccess onChanged={state.reload} />
        {tr(
          preview ? (
            <>
              <span className="chip">
                {tr("\u041A\u0430\u0440\u0442\u0430 \u043F\u0430\u0440\u044B")}
              </span>
              <div className="numbers-row">
                <div>
                  <strong>{tr(preview.profile_a.life_path)}</strong>
                  <span>{preview.profile_a.name}</span>
                </div>
                <div>
                  <strong>{tr(preview.profile_b.life_path)}</strong>
                  <span>{preview.profile_b.name}</span>
                </div>
              </div>
              <p>{tr(preview.profile_a.arithmetic)}</p>
              <p>{tr(preview.profile_b.arithmetic)}</p>
              <h3>{tr(preview.summary)}</h3>
              <ul className="feature-list large">
                {tr(
                  preview.locked.map((item) => <li key={item}>{tr(item)}</li>),
                )}
              </ul>
              <button
                className="primary-button"
                onClick={buy}
                disabled={loading}
              >
                {tr(
                  "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u043B\u043D\u044B\u0439 \u0440\u0430\u0437\u0431\u043E\u0440",
                )}
              </button>
            </>
          ) : (
            <>
              <h2>
                {tr(
                  "\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u043F\u0430\u0440\u044B",
                )}
              </h2>
              <p>
                {tr(
                  "\u0412\u044B \u0443\u0432\u0438\u0434\u0438\u0442\u0435 \u0447\u0438\u0441\u043B\u0430 \u043E\u0431\u043E\u0438\u0445 \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u043E\u0432, \u043F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u044B\u0439 \u0440\u0430\u0441\u0447\u0451\u0442 \u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0434\u043B\u044F \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u0433\u043E \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u0430.",
                )}
              </p>
            </>
          ),
        )}
      </div>
    </section>
  );
}
