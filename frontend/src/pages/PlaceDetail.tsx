import { useParams } from 'react-router-dom';

const PlaceDetail = () => {
  const { id } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-forest-green">Detalle del Lugar {id}</h1>
      <p>Vista en construcción...</p>
    </div>
  );
};

export default PlaceDetail;
