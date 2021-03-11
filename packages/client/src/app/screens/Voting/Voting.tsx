import * as React from "react";
import { useState, useEffect, useRef } from 'react';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Modal, Row } from "react-bootstrap";
import { Search } from 'react-bootstrap-icons';
import axios from 'axios';
import ProductDetail from "~/app/components/ProductDetail";
import socket from '~/app/service/Socket';
import { Tweet } from "react-twitter-widgets";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Rating, Producto, TweetData, ProductsProps } from '~/app/types/types';
import ProductDetailModal from "~/app/components/ProductDetailModal";

const Voting: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);
  const [producto, setProducto] = useState<string>("");
  const [addingProductA, setAddingProductA] = useState<boolean>(false);
  const [ratingA, setRatingA] = useState<Rating | null>(null);
  const [addingProductB, setAddingProductB] = useState<boolean>(false);
  const [productoA, setProductoA] = useState<Producto | null>(null);
  const [ratingB, setRatingB] = useState<Rating | null>(null);
  const [productoB, setProductoB] = useState<Producto | null>(null);
  const [productsModal, setProductsModal] = useState<Array<Producto> | null>(null);
  const [tweetsA, setTweetsA] = useState<Array<TweetData>>([]);
  const [tweetsB, setTweetsB] = useState<Array<TweetData>>([]);
  const [puntajeA, setPuntajeA] = useState<number>(0);
  const [puntajeB, setPuntajeB] = useState<number>(0);
  const [showStartButton, setStartButton] = useState<boolean>(true);

  function setWithExpiry(key: string, value: string, ttl: number) {
    const now = new Date()
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    }
    localStorage.setItem(key, JSON.stringify(item))
  }

  function getWithExpiry(key: string) {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) {
      return null
    }
    const item = JSON.parse(itemStr)
    const now = new Date()
    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }
    return item.value
  }

  const verifyToken = () => {
    const tokenML = getWithExpiry("at_ML");
    if (tokenML === null) {
      axios.get('http://localhost:5000/refresh_token', { withCredentials: true })
        .then((response) => {
          // 1 hour
          setWithExpiry("at_ML", response.data.atML, 3600000);
        });
    }
  }

  function percentage(quantity: number, total: number): number {
    return parseFloat(((100 * quantity) / total).toFixed(2));
  }

  const handleSelect = (producto: Producto) => {
    if (addingProductA)
      setProductoA(producto);
    if (addingProductB)
      setProductoB(producto);
  }

  const handleClose = () => {
    setShow(false);
    setProducto("");
    if (addingProductA) {
      setAddingProductA(false);
      setProductoA(null);
    }
    if (addingProductB) {
      setAddingProductB(false);
      setProductoB(null);
    }
    setProductsModal(new Array<Producto>());
  };

  const handleCloseSelect = () => {
    setShow(false);
    setProducto("");
    if (addingProductA)
      setAddingProductA(false);
    if (addingProductB)
      setAddingProductB(false);
    setProductsModal(new Array<Producto>());
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProducto(event.target.value);
  }
  
  const startVotation = () => {
    setPuntajeA(0);
    setPuntajeB(0);
    setTweetsA([]);
    setTweetsB([]);
    socket.emit('arrancar');
    setStartButton(false);
  };

  const finishVotation = () => {
    socket.emit('detener');
    setStartButton(true);
  };

  const resetAll = () => {
    setProductoA(null);
    setProductoB(null);
    setTweetsA([]);
    setTweetsB([]);
    setPuntajeA(0);
    setPuntajeB(0);
  }

  React.useEffect(() => {
    socket.on('tweet', (tweet: TweetData) => {
      // chequeo si el tweet pertenece al primer producto
      if (!showStartButton && productoA && tweet.text.search(productoA.id) != -1) {
        // me fijo si está en b y elimino
        if (tweetsB.length > 0) {
          const index: number = tweetsB.findIndex(tw => tw.username == tweet.username);
          if (index >= 0) {
            const twtsB: TweetData[] = tweetsB;
            twtsB.splice(index, 1);
            setTweetsB(twtsB);
          }
        }
        setTweetsA(tweetsA => [...tweetsA, tweet]);
      }
      // chequeo si el tweet pertenece al segundo producto
      if (!showStartButton && productoB && tweet.text.search(productoB.id) != -1) {
        if (tweetsA.length > 0) {
          const index: number = tweetsA.findIndex(tw => tw.username == tweet.username);
          if (index >= 0) {
            const twtsA: TweetData[] = tweetsA;
            twtsA.splice(index, 1);
            setTweetsA(twtsA);
          }
          setTweetsB(tweetsB => [...tweetsB, tweet]);
        }
      }
    });
    return () => {
      socket.off();
    }
  });

  useEffect(() => {
    if (producto.length > 0) {
      const tokenML = localStorage.getItem("at_ML");
      axios.get<ProductsProps>(`https://api.mercadolibre.com/sites/MLA/search?q=${producto}`, {
        headers: {
          'Authorization': `Bearer ${tokenML}`
        }
      })
        .then((response) => {
          const results = response.data.results;
          const showResults = results.slice(0, 5);
          setProductsModal(showResults);
        })
        .catch(function (error) {
          verifyToken();
          alert("[ML] Error en la búsqueda, intente nuevamente.");
        });
    }
  }, [producto]);

  useEffect(() => {
    if (productoA) {
      const tokenML = localStorage.getItem("at_ML");
      axios.get<Rating>(`https://api.mercadolibre.com/reviews/item/${productoA.id}`, {
        headers: {
          'Authorization': `Bearer ${tokenML}`
        }
      })
        .then((response) => {
          const rating = response.data;
          setRatingA(rating);
        });
    }
  }, [productoA]);

  useEffect(() => {
    if (productoB) {
      const tokenML = localStorage.getItem("at_ML");
      axios.get<Rating>(`https://api.mercadolibre.com/reviews/item/${productoB.id}`, {
        headers: {
          'Authorization': `Bearer ${tokenML}`
        }
      })
        .then((response) => {
          const rating = response.data;
          setRatingB(rating);
        });
    }
  }, [productoB]);

  useEffect(() => {
    const lengthA: number = tweetsA.length;
    const lengthB: number = tweetsB.length;
    const totalVotes: number = lengthA + lengthB;
    if (lengthA === 0)
      setPuntajeA(percentage(lengthA, totalVotes));
    if (lengthB === 0)
      setPuntajeB(percentage(lengthB, totalVotes));
    if (lengthA > 0 && lengthB > 0) {
      setPuntajeA(percentage(lengthA, totalVotes));
      setPuntajeB(percentage(lengthB, totalVotes));
    } else
      if (lengthA === 0 && lengthB > 0)
        setPuntajeB(percentage(lengthB, totalVotes));
      else
        if (lengthA > 0 && lengthB === 0)
          setPuntajeA(percentage(lengthA, totalVotes));
  }, [tweetsA, tweetsB]);

  return (
    <Container>
      <h3 className="text-center text-info">Votación realtime de productos de Mercado Libre</h3>
      <h5 className="text-center text-info mb-4">Votá en Twitter: #VotoRT + ID del producto</h5>
      <Row className="mb-2">
        <Col style={{ minHeight: "200px" }}>
          {(productoA && !addingProductA) ?
            <ProductDetail producto={productoA} productA={true} rating={ratingA ? ratingA.rating_average : 0} />
            : <> <Button variant="outline-success p-0 b-0" style={{ height: "100%" }} block onClick={() => { setShow(true); setAddingProductA(true) }}><h3>Seleccionar producto de Mercado Libre</h3></Button>
            </>}
        </Col>
        <Col style={{ minHeight: "200px" }}>
          {(productoB && !show) ?
            <ProductDetail producto={productoB} rating={ratingB ? ratingB.rating_average : 0} />
            : <> <Button variant="outline-danger p-0 b-0" style={{ height: "100%" }} block onClick={() => { setShow(true); setAddingProductB(true) }}><h3>Seleccionar producto de Mercado Libre</h3></Button>
            </>}
        </Col>
      </Row>
      <Row className="mb-2">
        <Col style={{ display: "flex", justifyContent: "center" }}>
          {((productoA || productoB) && (!addingProductA && !addingProductB))
            ? <Button variant="outline-warning mr-2" disabled={!showStartButton} onClick={(e) => { e.preventDefault(); resetAll() }}><h3>Seleccionar otros productos</h3></Button>
            : null}
          {showStartButton && <Button variant="outline-primary" disabled={productoA == null || productoB == null} onClick={(e) => { e.preventDefault(); startVotation() }}><h3>Iniciar votación</h3></Button>}
          {!showStartButton && <Button variant="outline-primary" onClick={(e) => { e.preventDefault(); finishVotation() }}><h3>Detener votación</h3></Button>}
        </Col>
      </Row>
      <ProgressBar style={{ height: "40px" }}>
        <ProgressBar striped variant="success" now={puntajeA} key={1} label={`${puntajeA}%`} />
        <ProgressBar striped variant="danger" now={puntajeB} key={2} label={`${puntajeB}%`} />
      </ProgressBar>
      <Row className="mb-2">
        <Col>
          {(productoA && tweetsA.length > 0) ? <h3 className="text-center">Votos por {productoA.id}</h3> : null}
          {tweetsA.map((tweetData: TweetData, index: number) => {
            return <Tweet key={index} tweetId={tweetData.idTweet} options={{ theme: "dark" }} />
          })
          }
        </Col>
        <Col>
          {(productoB && tweetsB.length > 0) ? <h3 className="text-center">Votos por {productoB.id}</h3> : null}
          {tweetsB.map((tweetData: TweetData, index: number) => {
            return <Tweet key={index} tweetId={tweetData.idTweet} options={{ theme: "dark" }} />
          })
          }
        </Col>
      </Row>
      <Modal animation={false} show={show}
        onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Búsqueda de producto</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <InputGroup>
              <FormControl
                placeholder="Escriba un producto..."
                aria-label="Escriba un producto..."
                aria-describedby="basic-addon2"
                value={producto}
                onChange={handleInputChange}
              />
              <InputGroup.Append>
                <Button variant="outline-secondary"><Search /></Button>
              </InputGroup.Append>
            </InputGroup>
            <ListGroup>
              {productsModal ?
                productsModal.map((product, index) => {
                  return (
                    <ListGroup.Item key={index} action onClick={(e) => { e.preventDefault(); handleSelect(product) }}>
                      {product.title}
                    </ListGroup.Item>)
                })
                : <></>
              }
            </ListGroup>

            {(productoA && addingProductA) ?
              <ProductDetailModal producto={productoA} />
              :
              <>
                {(productoB && addingProductB) ?
                  <ProductDetailModal producto={productoB} />
                  : null
                }
              </>
            }
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCloseSelect}>
              Seleccionar
          </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Voting;