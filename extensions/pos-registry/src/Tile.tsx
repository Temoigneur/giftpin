import '@shopify/ui-extensions/preact';
import {render} from 'preact';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  return (
    <s-tile
      heading="Gift registry"
      subheading="Find or start one"
      onClick={() => shopify.action.presentModal()}
    />
  );
}
