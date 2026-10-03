import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { formatRupees } from '../../utils/format';

export default function OrderItemsTable({ items, totals }) {
  return (
    <div className="table-scroll">
      <table className="order-table">
        <caption>Order summary</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Quantity</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const savedEach = Math.max(0, (item.originalPrice ?? item.price) - item.price);
            return (
              <Fragment key={item.productId}>
                <tr>
                  <th scope="row">{item.title}</th>
                  <td>{item.quantity}</td>
                  <td>{formatRupees(item.price * item.quantity)}</td>
                </tr>
                {savedEach > 0 ? (
                  <tr className="savings-row">
                    <th scope="row">Savings on {item.title}</th>
                    <td colSpan="2">−{formatRupees(savedEach * item.quantity)}</td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan="2">
              Subtotal
            </th>
            <td>{formatRupees(totals.subtotal)}</td>
          </tr>
          <tr>
            <th scope="row" colSpan="2">
              GST (18%)
            </th>
            <td>{formatRupees(totals.gst)}</td>
          </tr>
          <tr>
            <th scope="row" colSpan="2">
              Shipping
            </th>
            <td>{totals.shipping ? formatRupees(totals.shipping) : 'Free'}</td>
          </tr>
          <tr className="grand-total">
            <th scope="row" colSpan="2">
              Grand total
            </th>
            <td>{formatRupees(totals.grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

OrderItemsTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  totals: PropTypes.shape({
    subtotal: PropTypes.number.isRequired,
    gst: PropTypes.number.isRequired,
    shipping: PropTypes.number.isRequired,
    grandTotal: PropTypes.number.isRequired,
  }).isRequired,
};
