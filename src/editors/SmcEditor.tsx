import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

const TURNSTILE = `%class Turnstile
%start MainMap::Locked
%map MainMap
%%
Locked
{
  coin Unlocked { unlock(); }
  pass nil { alarm(); }
}
Unlocked
{
  pass Locked { lock(); }
  coin nil { thankyou(); }
}
%%
`;

const CODE_EXAMPLES = {
  es: {
    turnstile: TURNSTILE,
    trafficLight: `%class Semaforo
%start MainMap::Rojo
%map MainMap
%%
Rojo
{
  siguiente Verde { encenderVerde(); }
}
Verde
{
  siguiente Amarillo { encenderAmarillo(); }
}
Amarillo
{
  siguiente Rojo { encenderRojo(); }
}
%%
`,
    guards: `%class Cajero
%start MainMap::Esperando
%map MainMap
%%
Esperando
{
  ingresarPin [saldoDisponible()] Validado { mostrarMenu(); }
  ingresarPin [!saldoDisponible()] Bloqueado { alertar(); }
}
Validado
{
  retirar Esperando { entregarEfectivo(); }
}
Bloqueado
{
}
%%
`,
  },
  en: {
    turnstile: TURNSTILE,
    trafficLight: `%class TrafficLight
%start MainMap::Red
%map MainMap
%%
Red
{
  next Green { turnGreen(); }
}
Green
{
  next Yellow { turnYellow(); }
}
Yellow
{
  next Red { turnRed(); }
}
%%
`,
    guards: `%class ATM
%start MainMap::Waiting
%map MainMap
%%
Waiting
{
  enterPin [hasBalance()] Validated { showMenu(); }
  enterPin [!hasBalance()] Blocked { alert(); }
}
Validated
{
  withdraw Waiting { dispenseCash(); }
}
Blocked
{
}
%%
`,
  },
};

export default function SmcEditor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="smc"
      examples={CODE_EXAMPLES}
      exampleLabels={t.smc.examples}
      fileExt=".sm"
      downloadFilename="maquina.sm"
      exportFilename="diagrama-smc"
    />
  );
}
