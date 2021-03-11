import React from 'react';
import { Media } from 'react-bootstrap';
import { Producto } from '../types/types';

interface Props {
  producto: Producto;
}

function ProductDetailModal(props: Props) {
  const { thumbnail, title } = props.producto;
  return (
    <Media className="mt-2">
      <img
        width={64}
        height={64}
        className="mr-3"
        src={thumbnail}
        alt="thumbnail"
      />
      <Media.Body>
        <h4>Producto seleccionado:</h4>
        <h5>{title}</h5>
      </Media.Body>
    </Media>
  );
}

export default ProductDetailModal