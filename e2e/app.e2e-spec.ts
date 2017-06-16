import { TechSpacesSecurityPage } from './app.po';

describe('tech-spaces-security App', () => {
  let page: TechSpacesSecurityPage;

  beforeEach(() => {
    page = new TechSpacesSecurityPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
