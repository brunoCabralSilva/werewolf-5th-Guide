'use client'
import firebaseConfig from "@/firebase/connection";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { actionShowMenuSession, useSlice } from "@/redux/slice";
import { arrayUnion, collection, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import firestoreConfig from '../firebase/connection';
import { IoIosCloseCircleOutline } from "react-icons/io";

export default function MenuDm(props: { session: string }) {
  const { session } = props;
  const dispatch = useAppDispatch();
  const [optionSelect, setOptionSelect] = useState('general');
  const [players, setPlayers] = useState([]);
	const [listNotifications, setListNotifications] = useState<any[]>([]);
  const [nameSession, setNameSession] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [description, setDescription] = useState('');
  const [dm, setDm] = useState('');

	const returnValue = async () => {
		try {
			const db = getFirestore(firebaseConfig);
			const userQuery = query(collection(db, 'sessions'), where('name', '==', session));
			const userQuerySnapshot = await getDocs(userQuery);
      const sessionDoc = userQuerySnapshot.docs[0];
      const sessionData = sessionDoc.data();
      setNameSession(sessionData.name);
      setCreationDate(sessionData.creationDate);
      setDescription(sessionData.description);
      setDm(sessionData.dm);
			const players: any = [];
			userQuerySnapshot.forEach((doc: any) => players.push(...doc.data().players));
			setPlayers(players);
		} catch (error) {
			window.alert(`Erro ao obter a lista de jogadores: ` + error);
    }
	};

	const getNotifications = async() => {
		const db = getFirestore(firestoreConfig);
		const token = localStorage.getItem('Segredos Da Fúria');
    if (token) {
			const sessionsCollectionRef = collection(db, 'sessions');
			const sessionsQuerySnapshot = await getDocs(query(sessionsCollectionRef, where('name', '==', session)));
			const notifications = sessionsQuerySnapshot.docs[0].data().notifications;
			setListNotifications([...notifications]);
		}
	};

  useEffect(() => {
    setListNotifications([]);
		returnValue();
		getNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

	const returnDate = (msg: any) => {
    const data = new Date(msg.date);
    const formatoData = `${`${data.getDate() < 10 ? 0 : ''}${data.getDate()}`}/${data.getMonth() + 1}/${data.getFullYear()}`;
    const formatoHora = `${data.getHours() === 0 ? 0 : ''}${data.getHours()}:${data.getMinutes() < 10 ? 0: ''}${data.getMinutes()}:${data.getSeconds() < 10 ? 0 : ''}${data.getSeconds()}`;
    return `${formatoHora}, ${formatoData}`;
  }

  const remNotFromCache = async(list: any[]) => {
    const listNotif = listNotifications.filter(listNot => JSON.stringify(listNot) !== JSON.stringify(list));
    setListNotifications(listNotif);
  }

	const removeNotification = async (user: string, message: string) => {
		try {
			const mySession = session;
			const db = getFirestore(firestoreConfig);
			const sessionsCollectionRef = collection(db, 'sessions');
			const sessionsQuerySnapshot = await getDocs(query(sessionsCollectionRef, where('name', '==', mySession)));
			if (!sessionsQuerySnapshot.empty) {
				const sessionDoc = sessionsQuerySnapshot.docs[0];
				const sessionData = sessionDoc.data();
				const updatedNotifications = sessionData.notifications.filter((notification : any) => notification.email !== user && notification.message !== message);
				await updateDoc(sessionDoc.ref, { notifications: updatedNotifications });
			}
			getNotifications();
		} catch (error) {
			console.error("Ocorreu um erro:", error);
		}
	};
	
	const approveUser = async (list: {email: string, firstName: string, lastName: string, message: string }) => {
		try {
			const db = getFirestore(firestoreConfig);
			const sessionRef = collection(db, "sessions");
			const querySession = query(sessionRef, where("name", "==", session));
			const resultado: any = await getDocs(querySession);
			const players: any = [];
			const findByEmail = players.find((user: any) => user.email === list.email);
			if(!findByEmail) {
				const sheet = {
					session: session,
					email: list.email,
					user: `${list.firstName} ${list.lastName}`,
					creationData: Date.now(),
					data: {
						trybe: '',
						auspice: '',
						name: '',
						glory: 0,
						honor: 0,
						wisdom: 0,
						health: [],
						rage: 0,
						willpower: [],
						attributes: {
							strength: 1,
							dexterity: 1,
							stamina: 1,
							charisma: 1,
							manipulation: 1,
							composure: 1,
							intelligence: 1,
							wits: 1,
							resolve: 1,
						},
						skills: {
							athletics: { value: 0, specialty: '' },
							animalKen: { value: 0, specialty: '' },
							academics: { value: 0, specialty: '' },
							brawl: { value: 0, specialty: '' },
							etiquette: { value: 0, specialty: '' },
							awareness: { value: 0, specialty: '' },
							craft: { value: 0, specialty: '' },
							insight: { value: 0, specialty: '' },
							finance: { value: 0, specialty: '' },
							driving: { value: 0, specialty: '' },
							intimidation: { value: 0, specialty: '' },
							investigation: { value: 0, specialty: '' },
							firearms: { value: 0, specialty: '' },
							leadership: { value: 0, specialty: '' },
							medicine: { value: 0, specialty: '' },
							larceny: { value: 0, specialty: '' },
							performance: { value: 0, specialty: '' },
							occult: { value: 0, specialty: '' },
							melee: { value: 0, specialty: '' },
							persuasion: { value: 0, specialty: '' },
							politics: { value: 0, specialty: '' },
							stealth: { value: 0, specialty: '' },
							streetwise: { value: 0, specialty: '' },
							science: { value: 0, specialty: '' },
							survival: { value: 0, specialty: '' },
							subterfuge: { value: 0, specialty: '' },
							technology: { value: 0, specialty: '' },
						},
						gifts: [],
						rituals: [],
						advantagesAndFlaws: [],
						form: 'Hominídeo',
						background: '',
						notes: '',
					},
				};
				const docRef = resultado.docs[0].ref;
				await updateDoc(docRef, {
					players: arrayUnion({ ...sheet, date: Date.now() })
				});
			} 
			await removeNotification(list.email, list.message);
		} catch (error) {
				window.alert("Ocorreu um erro: " + error);
			}
	};

  return(
		<div className="bg-gray-whats-dark overflow-y-auto flex flex-col items-center justify-start h-screen px-4">
      <div className="w-full flex justify-end">
        <IoIosCloseCircleOutline
          className="text-4xl text-white cursor-pointer"
          onClick={() => dispatch(actionShowMenuSession(''))}
        />
      </div>
      <select
        onChange={ (e) => {
          setOptionSelect(e.target.value);
        }}
        className="w-full mb-2 border border-white p-3 cursor-pointer bg-black text-white flex items-center justify-center font-bold text-center"
      >
        <option value={'general'}>Geral</option>
        <option value={'notifications'}>Notificações</option>
        <option value={'personagens'}>Personagens</option>
      </select>
      {
        optionSelect === 'general' && <div className="flex flex-col items-center justify-start h-screen">
          <div className="text-white font-bold text-2xl my-5 capitalize">
            {session}
          </div>
          <p className="text-white pb-3 text-center">{ description }</p>
          <p className="text-white pb-3 text-center">Narrador: { dm }</p>
          <p className="text-white pb-3 text-center">Data de Criação: { returnDate({ date: creationDate }) }</p>
          <div className="text-white pb-3">
            <span className="pr-1">Jogadores:</span>
            {
              players.map((item: any, index: number) => (
                <span className="capitalize" key={index}>
                  { index === players.length -1 ? item.user + '.' : item.user + ', ' }
                </span>
              ))
            }
          </div>
        </div>
      }
      {
        optionSelect === 'notifications' && <div className="text-white w-full">
          {
            <div className="w-full">
              <button className="text-white bg-black border-2 border-white hover:border-red-800 transition-colorscursor-pointer w-full p-2 mt-1 mb-3 font-bold" onClick={getNotifications}>Atualizar</button>
              {
                listNotifications.map((listNot: any, index: number) => (
                  <div key={index} className="border-2 pt-1 px-1 border-white mb-2">
                    <div className="w-full flex justify-end pb-3">
                      <IoIosCloseCircleOutline
                        className="text-3xl text-white cursor-pointer"
                        onClick={() => remNotFromCache(listNot)}
                      />
                    </div>
                    <p className="text-center w-full px-3">{listNot.message}</p>
                    <div className="flex w-full gap-2 px-3 mb-3">
                      <button
                        type="button"
                        onClick={ () => removeNotification(listNot.user, listNot.message) }
                        className={`text-white bg-red-800 hover:border-red-900 transition-colors cursor-pointer border-2 border-white w-full p-2 mt-6 font-bold`}

                      >
                        Negar
                      </button>
                      <button
                        type="button"
                        onClick={ () => approveUser(listNot) }
                        className={`text-white bg-green-whats hover:border-green-900 transition-colors cursor-pointer border-2 border-white w-full p-2 mt-6 font-bold`}
                      >
                        Aceitar
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          }
        </div>
      }
      {
        optionSelect === 'personagens' && <div className="flex flex-col items-center justify-start h-screen z-50 top-0 right-0 w-full">
          <button className="text-white bg-black border-2 border-white hover:border-red-800 transition-colors my-1 mb-3 cursor-pointer w-full p-2 font-bold" onClick={returnValue}>Atualizar</button>
          {
            players.length > 0 && players.map((player: any, index) => (
              <div className="text-white w-full border-2 border-white flex flex-col items-center justify-center p-3 mb-4" key={index}>
                <h1 className="capitalize text-xl pt-5">{`${player.user} (${player.data.name === '' ? 'Sem nome': player.data.name})`}</h1>
                <hr className="w-full my-3" />
                <div>
                  <span className="font-bold pr-1">Tribo:</span>
                  <span className="capitalize">{ player.data.trybe === '' ? 'Indefinida' : player.data.trybe }</span>
                </div>
                <div>
                <span className="font-bold pr-1">Augúrio:</span>
                <span className="capitalize">{ player.data.auspice === '' ? 'Indefinido' : player.data.auspice }</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold pr-1">Fúria:</span>
                  <span>{ player.data.rage }</span>
                </div>
                <div>
                  <span className="font-bold pr-1">Força de Vontade Total:</span>
                  <span className="capitalize">{ player.data.attributes.composure + player.data.attributes.resolve }</span>
                </div>
                <div className="">
                  <span className="font-bold pr-1">Vitalidade:</span>
                  <span className="capitalize">{ player.data.form === 'Crinos' ? player.data.attributes.stamina + 7 : player.data.attributes.stamina + 3}</span>
                </div>
                <div className="mt-3">
                  <span className="font-bold pr-1">Forma Atual:</span>
                  <span className="capitalize">{ player.data.form }</span>
                </div>
                <p className="font-bold pr-1 mt-3">Renome</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full">
                  <p className="text-center">
                    Honra: { player.data.honor }
                  </p>
                  <p className="text-center">
                    Glória: { player.data.glory }
                  </p>
                  <p className="text-center">
                    Sabedoria: { player.data.wisdom }
                  </p>
                </div>
                <p className="font-bold pr-1 mt-3">Atributos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full">
                  {
                    Object.entries(player.data.attributes).map(([chave, valor]: any, index) => (
                      <div className="capitalize text-center" key={index}>
                        {chave}: {valor}
                      </div>
                    ))
                  }
                </div>
                <p className="font-bold pr-1 mt-3">Habilidades</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full">
                  {
                    Object.entries(player.data.skills).map(([chave, valor]: any, index) => {
                      if (valor.value !== 0)
                      return (
                        <div className="capitalize text-center w-full" key={index}>
                          {chave}: { valor.value }
                          {valor.specialty === '' ? '' : (valor.specialty)}
                        </div>
                      )
                    })
                  }
                </div>
                <p className="font-bold pr-1 w-full text-center mt-3">Dons</p>
                <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
                { 
                  player.data.gifts.length === 0
                    ? 'Nenhum'
                    : player.data.gifts.map((gift: any, index: number) => (
                        <p className="text-center" key={index}>{ gift.giftPtBr }</p>
                      ))
                }
                </div>
                <p className="font-bold pr-1 w-full text-center mt-3">Rituais</p>
                <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
                { 
                  player.data.rituals.length === 0
                    ? 'Nenhum'
                    : player.data.rituals.map((ritual: any, index: number) => (
                        <p className="text-center" key={index}>{ ritual.titlePtBr }</p>
                      ))
                }
                </div>
                <p className="font-bold pr-1 w-full text-center mt-3">Background</p>
                <p className="w-full text-center">{ player.data.background }</p>
                <p>Ficha criada em: { returnDate(player) }</p>
              </div>
            ))
          }
        </div>
      }
		</div>
  )
}