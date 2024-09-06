import { getOfficialTimeBrazil } from "./utilities";
import firebaseConfig from "./connection";
import { doc, getFirestore, runTransaction } from "firebase/firestore";
import { authenticate } from "./authenticate";
import { getSessionById } from "@/firebase/sessions";

const verifyResult = (
	rollOfRage: number[],
	rollOfMargin: number[],
	dificulty: number
) => {
	let success = 0;
	let fail = 0;
	let brutal = 0;
	let critical = 0;

	if (rollOfRage) {
		for (let i = 0; i < rollOfRage.length; i += 1) {
			if (Number(Number(rollOfRage[i])) === 10) critical += 1;
			else if (Number(rollOfRage[i]) > 2 && Number(rollOfRage[i]) < 6) fail += 1;
			else if (Number(rollOfRage[i]) > 5 && Number(rollOfRage[i]) < 10) success += 1;
			else brutal += 1;
		}
	}
	
	if (rollOfMargin) {
		for (let i = 0; i < rollOfMargin.length; i += 1) {
			if (Number(rollOfMargin[i]) === 10) critical += 1;
			else if (Number(rollOfMargin[i]) > 2 && Number(rollOfMargin[i]) < 6) fail += 1;
			else if (Number(rollOfMargin[i]) > 5 && Number(rollOfMargin[i]) < 10) success += 1;
			else fail += 1;
		}
	}
	
	let paresBrutais = 0;
	let paresCriticals = 0;
	if (brutal % 2 !== 0) brutal -= 1;
	paresBrutais = brutal * 2;
	if (critical % 2 !== 0 && critical !== 1) {
		critical -= 1;
		success += 1;
	}
	if (critical > 1) paresCriticals = critical * 2
	else paresCriticals = critical;
	let sucessosParaDano = paresBrutais + paresCriticals + success - Number(dificulty);
	const falhaBrutal = brutal > 1;
	if (sucessosParaDano === 0) sucessosParaDano += 1;

	let msg = '';

	if (falhaBrutal) {
		if (sucessosParaDano >= 0) {
			msg = 'Obteve sucesso se a ação foi CAUSAR DANO (Caso contrário, ocorreu uma falha brutal).';
		} else {
			msg = `Falhou no teste, pois a dificuldade era ${Number(dificulty)} e número de sucessos foi ${Number(paresBrutais + paresCriticals + success)}. `;
		}
	} else {
		if (sucessosParaDano >= 0) msg =  'Obteve sucesso no teste!';
		else {
			msg = `Falhou no teste, pois a dificuldade era ${Number(dificulty)} e número de sucessos foi ${Number(paresBrutais + paresCriticals + success)}. `;
		}
	}
	return {
		message: msg,
		brutalPairs: paresBrutais,
		criticalPairs: paresCriticals,
		success,
		successesForDamage: sucessosParaDano,
	}
}

const rollTest = (
	valueOfRage: number,
	valueOf: number,
	penaltyOrBonus: number,
	dificulty: number,
) => {
	let resultOfRage = [];
	let resultOf = [];
	let valueWithPenaltyOfBonus = Number(penaltyOrBonus) + Number(valueOf);

	for (let i = 0; i < Number(valueOfRage); i += 1) {
		const value = Math.floor(Math.random() * 10) + 1;
		resultOfRage.push(value);
	}

	for (let i = 0; i < Number(valueWithPenaltyOfBonus); i += 1) {
		const value = Math.floor(Math.random() * 10) + 1;
		resultOf.push(value);
	}

	const generate = verifyResult(resultOfRage, resultOf, dificulty);
	
	return {
		...generate,
		margin: resultOf,
		rage: resultOfRage,
		dificulty,
		penaltyOrBonus,
		type: 'roll',
	}
}

export const registerMessage = async (sessionId: string, data: any, email: string | null) => {
  try {
    const authData: any = await authenticate();
    if (authData && authData.email && authData.displayName) {
      const date = await getOfficialTimeBrazil();
      const db = getFirestore(firebaseConfig);
      await runTransaction(db, async (transaction: any) => {
        const sessionDocRef = doc(db, 'sessions2', sessionId);
        const sessionDocSnapshot = await transaction.get(sessionDocRef);
        if (sessionDocSnapshot.exists()) {
					let emailToRecord = email;
					if (!emailToRecord) emailToRecord = authData.email;
          const sessionData = sessionDocSnapshot.data();
          const updatedChat = [
            ...sessionData.chat,
            { date, email: emailToRecord, user: authData.displayName, ...data },
          ];
          transaction.update(sessionDocRef, { chat: updatedChat });
        } else {
          throw new Error("Não foi possível localizar a Sessão. Por favor, atualize a página e tente novamente.");
        }
      });
    }
  } catch (error) {
    throw new Error('Ocorreu um erro ao enviar a mensagem: ' + error);
  }
};

export const registerManualRoll = async(
	sessionId: string,
	rage: number,
	valueOf: number,
	penaltyOrBonus: number,
	dificulty: number
) => {
	const roll = rollTest(rage, valueOf, penaltyOrBonus, dificulty);
	await registerMessage(sessionId, roll, null);
}

export const registerAutomatedRoll = async(
	sessionId: string,
	emailUser: string,
	atrSelected: string,
	sklSelected: string,
	renSelected: string,
	penaltyOrBonus: number,
	dificulty: number,
) => {
	let valueOf = 0;
	let rage = 0;
	try {
		const session = await getSessionById(sessionId);
		if (session) {
			const playing = session.players.find((player: any) => player.email === emailUser);
			rage = Number(playing.data.rage);
			valueOf = Number(playing.data.attributes[atrSelected])
			+ Number(playing.data.skills[sklSelected])
			+ Number(playing.data.renown[renSelected])
			- rage;
			if (valueOf < 0) valueOf = 0;
			const roll = rollTest(rage, valueOf, penaltyOrBonus, dificulty);
			await registerMessage(sessionId, roll, emailUser);
		} else throw new Error ('Sessão não encontrada.');
	} catch(error) {
		window.alert('Ocorreu um erro ao buscar os dados do Jogador. Por favor, atualize a página e tente novamente' + '('+ error +').');
	}
}