import React from 'react';
import { Badge, Media } from 'react-bootstrap';
import ReactStars from "react-rating-stars-component";
import { ProductDetailsProps } from '../types/types';

function ProductDetail(props: React.PropsWithChildren<ProductDetailsProps>) {
  const { producto, productA, rating } = props;
  return (
    <Media style={{ height: "100%", border: productA ? "1px solid #28A745" : "1px solid #DC3545", borderRadius: "4px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <img
        width={64}
        height={64}
        className="mr-3"
        src={producto.thumbnail}
        alt="thumbnail"
      />
      <Media.Body>
        {producto.condition === "new" ? <p className="text-gray mb-0">Nuevo{producto.sold_quantity > 0 ? ` | ${producto.sold_quantity} vendidos` : <></>}</p> : <></>}
        <h5 className="mb-0">{producto.title}</h5>
        <ReactStars
          count={5}
          value={rating}
          size={18}
          isHalf={true}
          edit={false}
          emptyIcon={<i className="far fa-star"></i>}
          halfIcon={<i className="fa fa-star-half-alt"></i>}
          fullIcon={<i className="fa fa-star"></i>}
          activeColor="#ffd700"
        />
        <h3>$ {producto.price}</h3>
        <a href={producto.permalink} target="_blank">Ver producto en Mercado Libre</a>
        <h1>
          <Badge pill variant={productA ? "success" : "danger"}>ID: {producto.id}</Badge>
        </h1>
      </Media.Body>
    </Media>
  );
}

export default ProductDetail