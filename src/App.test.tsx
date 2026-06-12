import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the DateJared scaffold shell', () => {
    render(<App />);

    expect(screen.getByText('DateJared')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /warm start for intentional dating/i })).toBeInTheDocument();
  });
});
