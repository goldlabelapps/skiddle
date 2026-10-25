import { EventSearch } from '../components/EventSearch/EventSearch';

export default function HomePage() {
  return (
    <main
      style={{
        flex: 1,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <EventSearch />
    </main>
  );
}
