import {render, screen} from '@testing-library/angular';
import {provideRouter} from '@angular/router';
import {BottomNav} from './bottom-nav';

describe('BottomNav', () => {
  async function setup() {
    return render(BottomNav, {
      providers: [
        provideRouter([
          {path: 'home', component: BottomNav},
          {path: 'beastery', component: BottomNav},
          {path: 'players', component: BottomNav},
        ])
      ]
    });
  }

  it('should create', async () => {
    const {fixture} = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render 3 navigation tabs', async () => {
    await setup();
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3);
  });

  it('should display correct tab labels', async () => {
    await setup();
    expect(screen.getByText('Sessions')).toBeTruthy();
    expect(screen.getByText('Monsters')).toBeTruthy();
    expect(screen.getByText('Players')).toBeTruthy();
  });

  it('should have correct routerLink for Sessions tab', async () => {
    await setup();
    const link = screen.getByText('Sessions').closest('a');
    expect(link?.getAttribute('href')).toBe('/home');
  });

  it('should have correct routerLink for Monsters tab', async () => {
    await setup();
    const link = screen.getByText('Monsters').closest('a');
    expect(link?.getAttribute('href')).toBe('/beastery');
  });

  it('should have correct routerLink for Players tab', async () => {
    await setup();
    const link = screen.getByText('Players').closest('a');
    expect(link?.getAttribute('href')).toBe('/players');
  });

  it('should render SVG icons for each tab', async () => {
    await setup();
    const navElement = screen.getByRole('navigation');
    const svgs = navElement.querySelectorAll('svg');
    expect(svgs.length).toBe(3);
  });
});
