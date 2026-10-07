export default function Status({ loading, error, reload }) {
  if (loading)
    return (
      <div className="status" role="status">
        <span className="loading-dot" />
        Загружаем ваше пространство…
      </div>
    );
  if (error)
    return (
      <div className="status error" role="alert">
        <p>{error}</p>
        {reload && (
          <button className="secondary-button" onClick={reload}>
            Попробовать снова
          </button>
        )}
      </div>
    );
  return null;
}
