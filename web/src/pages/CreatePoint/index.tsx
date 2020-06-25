import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import './styles.css';
import Dropzone from "../../components/Dropzone";

import logo from '../../assets/logo.svg'
import api from '../../services/api'
import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface UFSigla {
    sigla: string;
}

interface UFCity {
    nome: string;
}

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState("0");
    const [selectedCity, setSelectedCity] = useState("0");
    const [selectedPosition, setSelectedPosicion] = useState<[number, number]>([0, 0]);
    const [initialPosition, setIntialPosicion] = useState<[number, number]>([0, 0]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });
    const [seletedItem, setSelectedItem] = useState<number[]>([])
    const [selectedFile, setSelectedFile] = useState<File>()
    const history = useHistory();

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, [])
    useEffect(() => {
        // http://angoprovsapi.herokuapp.com/api/v1/provincias

        axios.get<UFSigla[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);

        })
    }, [])

    useEffect(() => {
        //Carregar as cidades sempre que as Ufs mudar
        if (selectedUf === '0') {
            return;
        }

        axios.get<UFCity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cityInitials = response.data.map(city => city.nome);
            setCities(cityInitials);
        })


    }, [selectedUf]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setIntialPosicion([latitude, longitude]);
        })
    }, [])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapclick(event: LeafletMouseEvent) {
        setSelectedPosicion([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value })

    }

    function handleSelectItem(id: number) {
        const alreadySelectItem = seletedItem.findIndex(item => item === id);
        if(alreadySelectItem >= 0){
            const filtered = seletedItem.filter(item=> item !== id);
            setSelectedItem(filtered);
        }else{
            setSelectedItem([...seletedItem, id]);
        }
    }

   async function hundleSubmit(event: FormEvent){
        event.preventDefault();
        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = seletedItem;

        const data = new FormData;

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        if(selectedFile){
            data.append('image', selectedFile);
        }

        console.log(data);
        await api.post('points', data);
        alert('Ponto de coleta criado');
        history.push('/');
    }
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={hundleSubmit}>
                <h1>Cadastro do <br /> ponto de Coleta</h1>
                <Dropzone onFileUploaded={setSelectedFile}/>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Seleccione o endereço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={15} onClick={handleMapclick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}>

                        </Marker>
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Seleccione uma estado</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select value={selectedCity} name="city" id="city" onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Seleccione um ou mais ítens a baixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item =>
                            <li className={seletedItem.includes(item.id)? 'selected': ''} key={item.id} onClick={() => handleSelectItem(item.id)}>
                                <img src={item.image_url} alt="" />
                                <span>{item.title}</span>
                            </li>
                        )}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>

        </div>
    )
}

export default CreatePoint;