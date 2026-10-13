import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import TrialAccess from "../components/TrialAccess";

export default function Compatibility() {
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
      JSON.stringify({ name: form.name_b, birth_date: form.birth_date_b }),
    );
    navigate("/checkout?product=compatibility");
  }

  return (
    <section className="section-grid compatibility-page">
      <form className="soft-card form-grid" onSubmit={submit}>
        {error && <p role="alert">{error}</p>}
        <span className="eyebrow">Диалог начинается с внимания</span>
        <h1>Совместимость пары</h1>
        <input
          required
          maxLength={128}
          aria-label="Ваше имя"
          placeholder="Ваше имя"
          value={form.name_a}
          onChange={(e) => setForm({ ...form, name_a: e.target.value })}
        />
        <input
          required
          aria-label="Ваша дата рождения"
          type="date"
          min="1900-01-01"
          max={localDay()}
          value={form.birth_date_a}
          onChange={(e) => setForm({ ...form, birth_date_a: e.target.value })}
        />
        <input
          required
          maxLength={128}
          aria-label="Имя партнёра"
          placeholder="Имя партнёра"
          value={form.name_b}
          onChange={(e) => setForm({ ...form, name_b: e.target.value })}
        />
        <input
          required
          aria-label="Дата рождения партнёра"
          type="date"
          min="1900-01-01"
          max={localDay()}
          value={form.birth_date_b}
          onChange={(e) => setForm({ ...form, birth_date_b: e.target.value })}
        />
        <button className="primary-button" disabled={loading}>
          {loading ? "Считаю..." : "Рассчитать карту пары"}
        </button>
      </form>
      <div className="soft-card locked-card">
        <TrialAccess onChanged={state.reload} />
        {preview ? (
          <>
            <span className="chip">Карта пары</span>
            <div className="numbers-row">
              <div>
                <strong>{preview.profile_a.life_path}</strong>
                <span>{preview.profile_a.name}</span>
              </div>
              <div>
                <strong>{preview.profile_b.life_path}</strong>
                <span>{preview.profile_b.name}</span>
              </div>
            </div>
            <p>{preview.profile_a.arithmetic}</p>
            <p>{preview.profile_b.arithmetic}</p>
            <h3>{preview.summary}</h3>
            <ul className="feature-list large">
              {preview.locked.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button className="primary-button" onClick={buy} disabled={loading}>
              Открыть полный разбор
            </button>
          </>
        ) : (
          <>
            <h2>Заполните данные пары</h2>
            <p>
              Вы увидите числа обоих партнёров, прозрачный расчёт и вопросы для
              спокойного разговора.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
