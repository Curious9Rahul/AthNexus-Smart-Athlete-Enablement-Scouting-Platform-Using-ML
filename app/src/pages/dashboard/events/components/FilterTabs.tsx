type Props = {
  active: string;
  setActive: (v: string) => void;
  tabs: string[];
  ariaLabel?: string;
};

const FilterTabs = ({ active, setActive, tabs, ariaLabel = "Event Filters" }: Props) => {
  return (
    <div className="filter-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`filter-tab ${active === tab ? "active" : ""}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;

