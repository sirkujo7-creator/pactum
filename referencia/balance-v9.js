// Herramienta de balance ORIGINAL de la versión 9 (referencia, no borrar).
// Contiene la lógica de la v9 tal cual. La herramienta actual es herramientas/balance.js, que usa src/core.
// Uso: node referencia/balance-v9.js   (opcional: DIF=facil|normal|dificil  REG=republica|monarquia|...  NG=300  ETH=util|deon|contr|real|virt)
// Estrategias: pop = impuestos casi nulos, rich = cargar a los pobres, fair = impuestos equilibrados, debt = vivir de la deuda.

const N = 20;
const B = {
  casa:{e:'🏠',n:'Casas',a:'unas casas',cost:30,up:1,st:0,ok:['llano','bosque'],d:'Alojan 10 personas.'},
  cultivo:{e:'🌾',n:'Cultivo',a:'un cultivo',cost:25,up:1,st:0,ok:['llano'],jc:7,d:'Emplea 7 campesinos. Da 12 de alimento (16 junto al río) si tiene todos sus trabajadores.'},
  mercado:{e:'🏪',n:'Mercado',a:'un mercado',cost:60,up:3,st:0,ok:['llano'],ja:5,fee:8,d:'Emplea 5 artesanos, cobra 8 de tasas y atrae élite comerciante.'},
  parque:{e:'🌳',n:'Parque',a:'un parque',cost:30,up:2,st:0,ok:['llano','bosque'],d:'Mejora el ánimo de los artesanos y el ambiente.'},
  escuela:{e:'🏫',n:'Escuela',a:'una escuela',cost:80,up:8,st:1,ok:['llano'],ja:3,d:'Cubre a 50 personas. Emplea 3. Sube igualdad.'},
  hospital:{e:'🏥',n:'Hospital',a:'un hospital',cost:100,up:10,st:1,ok:['llano'],ja:3,d:'Cubre a 60 personas. Emplea 3.'},
  taller:{e:'🏭',n:'Taller',a:'un taller',cost:90,up:4,st:1,ok:['llano'],ja:9,d:'Emplea 9 artesanos y enriquece a la élite. Contamina.'},
  agora:{e:'🏛️',n:'Ágora',a:'un ágora',cost:150,up:6,st:2,ok:['llano'],ja:1,d:'Lugar de deliberación. Sube la confianza. Necesaria para la Polis.'},
  mina:{e:'⛏️',n:'Mina',a:'una mina',cost:120,up:5,st:2,ok:['montana'],ja:10,fee:25,d:'Solo en montaña. Emplea 10 y paga 25 de regalías. Daña mucho el ambiente.'},
  banco:{e:'🏦',n:'Banco',a:'un banco',cost:200,up:6,st:2,ok:['llano'],ja:2,d:'Baja 2 puntos tu tasa, frena la inflación y atrae élite.'},
  cafetal:{e:'☕',n:'Cafetal',a:'un cafetal',cost:45,up:1,st:0,ok:['llano','bosque'],hmin:1,jc:6,fee:10,d:'Solo en ladera (terreno alto). Emplea 6 campesinos y exporta café: 10 de oro al año.'},
  acueducto:{e:'💧',n:'Acueducto',a:'un acueducto',cost:70,up:4,st:1,ok:['llano'],river:true,ja:2,water:70,d:'Junto al río. Da agua a 70 personas más. Sin agua, el pueblo no crece y se enoja.'},
  molino:{e:'⚙️',n:'Molino de agua',a:'un molino',cost:80,up:3,st:1,ok:['llano'],river:true,ja:2,energy:3,d:'Junto al río. Da energía a 3 talleres. Un taller sin energía no da empleo.'},
  puerto:{e:'⛵',n:'Puerto fluvial',a:'un puerto',cost:110,up:4,st:2,ok:['llano'],river:true,ja:5,fee:18,d:'Junto al río. Emplea 5 y cobra 18 de comercio. Atrae élite comerciante.'},
  universidad:{e:'🎓',n:'Universidad',a:'una universidad',cost:250,up:15,st:3,ok:['llano'],ja:5,d:'10% más productividad. Sube igualdad.'}
};
const STAGES = [
  {n:'Aldea'},
  {n:'Pueblo', req:'40 habitantes', ok:c=>S.pop>=40,
   lesson:'Con más gente llegan más exigencias: ahora el pueblo espera escuelas y hospitales. Se abren préstamos, bonos y la emisión de moneda. Cuidado: tu calificación de riesgo decide cuánto te cobran.'},
  {n:'Ciudad', req:'80 habitantes, una escuela y un hospital', ok:c=>S.pop>=80&&c.escuela>=1&&c.hospital>=1,
   lesson:'La ciudad produce riqueza y también desigualdad entre clases. Se abren el ágora, la mina y el banco. Decide qué modelo de desarrollo quieres.'},
  {n:'Polis', req:'150 habitantes, un ágora y confianza de 55', ok:c=>S.pop>=150&&c.agora>=1&&S.tr>=55,
   lesson:'Ahora el poder se renueva en elecciones cada 4 años: si la confianza está por debajo de 50, pierdes el mandato. Sostén la Polis el tiempo que exige tu nivel de dificultad. Y ojo: cada año el pueblo espera más calidad de vida.'}
];
const PH = {util:{n:'Utilitarismo',a:'Mill'},deon:{n:'Ética del deber',a:'Kant'},contr:{n:'Justicia como equidad',a:'Rawls'},real:{n:'Realismo político',a:'Maquiavelo'},virt:{n:'Ética de la virtud',a:'Aristóteles'}};
const PROFILE = {
  util:'Buscaste el mayor bien para el mayor número, aunque algunos pagaran el costo.',
  deon:'Gobernaste por principios: cumpliste deberes aunque salieran caros.',
  contr:'Pusiste primero a los menos favorecidos: reglas que aceptarías sin saber qué lugar te tocaría.',
  real:'Priorizaste conservar el poder y la estabilidad por encima de los ideales.',
  virt:'Buscaste el término medio y el florecimiento de la comunidad.'
};
const FXL = {t:'oro',f:'alimento',p:'habitantes',h:'ánimo general',e:'igualdad',c:'confianza',a:'ambiente',d:'deuda',sc:'campesinos',sa:'artesanos',se:'élite',i:'% inflación',txe:'% impuesto élite'};
const BADUP = {d:1,i:1};
const RAT = [[85,'AAA',0],[75,'AA',.01],[65,'A',.02],[55,'BBB',.04],[45,'BB',.07],[35,'B',.11],[-999,'CCC',.16]];

const EV = [
 {id:'crecida',st:0,e:'🌊',title:'El río se desborda',text:'Tras semanas de lluvia, el río inunda las casas de la orilla. Las familias esperan tu decisión.',opts:[
  {l:'Construir diques',fx:{t:-80,c:8},f:'deon',why:'Proteger a cada ciudadano es un deber, no un cálculo de costos.',later:[6,'diques']},
  {l:'Reubicar a las familias ribereñas',fx:{t:-15,sc:-6,e:-4,a:4},f:'util',why:'Sale más barato para la mayoría, aunque algunas familias pierden su hogar.'},
  {l:'Esperar a que baje el agua',fx:{c:-10,p:-3,f:-10,se:2},f:'real',why:'Ahorras hoy, pero el pueblo recuerda quién lo dejó solo.',later:[3,'crecida_mal']}]},
 {id:'festival',st:0,e:'🎺',title:'Llega el festival folclórico',text:'Músicos y danzantes quieren celebrar en la plaza. Alguien tiene que pagar.',opts:[
  {l:'Financiar el festival',fx:{t:-45,h:8,c:3},f:'virt',why:'La vida buena también se construye celebrando en comunidad.'},
  {l:'Cobrar entrada',fx:{t:30,se:3,sc:-4,e:-5},f:'util',why:'Hay fiesta y el tesoro gana, pero los más pobres miran desde afuera.'},
  {l:'Cancelarlo',fx:{h:-6},f:'real',why:'Austeridad: el tesoro se protege, el ánimo no.'}]},
 {id:'sal',st:0,e:'🧂',title:'Un mercader quiere el monopolio',text:'Ofrece 80 de oro a cambio de ser el único que venda sal en el territorio.',opts:[
  {l:'Aceptar el trato',fx:{t:80,e:-8,c:-5,se:6},f:'real',why:'Ganas recursos y un aliado poderoso, a costa del precio que pagará todo el pueblo.',later:[4,'sal_mal']},
  {l:'Rechazarlo',fx:{c:4,sa:-3,se:-3},f:'contr',why:'Ninguna ventaja privada es justa si empeora la situación de los más débiles.'}]},
 {id:'sequia',st:0,e:'☀️',title:'Sequía',text:'No llueve. Las cosechas de este año serán escasas.',cond:c=>c.cultivo>0,opts:[
  {l:'Racionar por igual',fx:{f:-15,h:-5,e:5},f:'contr',why:'Si la escasez es de todos, el sacrificio también.'},
  {l:'Comprar alimento afuera',fx:{t:-50,i:2,f:5},f:'util',why:'El dinero resuelve hoy el problema de todos, aunque los precios suben.'},
  {l:'Dar prioridad a quienes trabajan la tierra',fx:{f:-15,e:-6,sa:-6,sc:4},f:'real',why:'Mantienes la producción, pero dejas atrás a quienes no producen.'}]},
 {id:'migra',st:0,e:'🧳',title:'Familias desplazadas piden refugio',text:'Llegan huyendo de la violencia en otra región. No traen nada.',opts:[
  {l:'Acogerlas',fx:{p:8,f:-8,sa:-3,c:3,e:2},f:'deon',why:'Toda persona es un fin en sí misma, nunca un simple costo.',later:[5,'migra_bien']},
  {l:'Acogerlas a cambio de trabajo',fx:{p:6,t:10,e:-3},f:'util',why:'Todos ganan algo, aunque la dignidad quede condicionada.'},
  {l:'Cerrar el paso',fx:{c:-4,sa:3,se:2},f:'real',why:'Proteges los recursos propios; la historia juzgará.',later:[5,'migra_mal']}]},
 {id:'donante',st:0,e:'💰',title:'Una familia rica ofrece una donación',text:'Darán 100 de oro si la plaza principal lleva su apellido.',opts:[
  {l:'Aceptar',fx:{t:100,e:-2,se:4},f:'util',why:'El beneficio es concreto; el costo parece simbólico.',later:[5,'donante_mal']},
  {l:'Rechazar',fx:{c:3,se:-3},f:'deon',why:'Lo público no se vende, aunque la oferta sea generosa.'}]},
 {id:'plaga',st:0,e:'🐛',title:'Plaga en los cultivos',text:'Un insecto avanza sobre las cosechas.',cond:c=>c.cultivo>1,opts:[
  {l:'Fumigar con químicos',fx:{t:-20,a:-8,sc:3},f:'util',why:'Rápido y barato; el costo lo paga la tierra.'},
  {l:'Control biológico',fx:{t:-35,a:2,f:-8},f:'virt',why:'Más lento y caro: el término medio entre producir y cuidar.'},
  {l:'Dejar que pase',fx:{f:-20,sc:-6},f:'real',why:'Ahorras oro y pierdes comida.'}]},
 {id:'evasion',st:1,e:'📜',title:'Un terrateniente evade impuestos',text:'Todos lo saben. Todos miran qué harás.',opts:[
  {l:'Cobrarle y multarlo',fx:{t:50,c:7,se:-5,sc:3},f:'deon',why:'La ley vale igual para todos o no vale.',later:[4,'evasion_venganza',.5]},
  {l:'Negociar un pago parcial',fx:{t:20,c:-2},f:'util',why:'Algo es mejor que nada, aunque el mensaje sea ambiguo.'},
  {l:'Perdonarlo a cambio de su apoyo',fx:{c:-9,e:-5,se:6},f:'real',why:'Ganas un aliado; pierdes autoridad moral.',later:[4,'evasion2']}]},
 {id:'tierras',st:1,e:'🌱',title:'Los campesinos piden tierras',text:'Trabajan haciendas ajenas y quieren parcelas propias.',opts:[
  {l:'Hacer una reforma agraria',fx:{t:-30,sc:15,se:-15,e:8},f:'contr',why:'La distribución inicial de la riqueza también es un asunto de justicia.',later:[3,'reforma_fuga',.6]},
  {l:'Ofrecer créditos para comprar tierra',fx:{d:60,sc:7,se:-2},f:'util',why:'Una solución de mercado: lenta, pero sin choques.'},
  {l:'Rechazar la petición',fx:{sc:-10,se:5},f:'real',why:'Proteges a los propietarios y a tus aliados.',later:[5,'tierras_mal']}]},
 {id:'maestros',st:1,e:'🧑‍🏫',title:'Los maestros piden mejor salario',text:'Dicen que sin maestros bien pagados no hay futuro.',cond:c=>c.escuela>0,opts:[
  {l:'Subir el salario',fx:{t:-40,sa:5,e:4},f:'contr',why:'La educación es la vía para que los menos favorecidos mejoren su lugar.',later:[6,'maestros_bien']},
  {l:'Pagar con deuda',fx:{d:50,sa:4},f:'util',why:'Resuelves hoy y trasladas el costo a los gobiernos de mañana.'},
  {l:'Negarse',fx:{sa:-8,c:-4,se:3},f:'real',why:'Cuidas el tesoro; pierdes a quienes forman ciudadanos.'}]},
 {id:'huelga',st:1,e:'✊',title:'Huelga en los talleres',text:'Los artesanos paran: exigen salarios que alcancen.',cond:c=>c.taller>0,opts:[
  {l:'Mediar por un salario justo',fx:{sa:12,se:-8,e:4},f:'contr',why:'El trabajo digno no es un favor del patrón.'},
  {l:'Subsidiar el aumento con el tesoro',fx:{t:-50,sa:8},f:'util',why:'Todos contentos, pero lo paga el erario.'},
  {l:'Romper la huelga',fx:{sa:-15,c:-8,se:6},f:'real',why:'El orden vuelve; el resentimiento queda.',later:[4,'huelga_mal']}]},
 {id:'humo',st:1,e:'🌫️',title:'Los talleres contaminan el río',text:'Los pescadores denuncian peces muertos río abajo.',cond:c=>c.taller>0,opts:[
  {l:'Obligar a poner filtros',fx:{t:-40,a:12,se:-3},f:'deon',why:'Nadie tiene derecho a dañar lo que es de todos.'},
  {l:'Multar a los dueños',fx:{t:30,a:3,se:-4},f:'util',why:'El tesoro gana y el daño se reduce un poco.'},
  {l:'Ignorar la denuncia',fx:{a:-10,c:-5,se:5},f:'real',why:'La producción sigue; el río no vota.',later:[4,'humo_mal']}]},
 {id:'corrup',st:1,e:'🕵️',title:'Rumores de corrupción',text:'Dicen que tu tesorero desvía fondos públicos.',opts:[
  {l:'Investigar públicamente',fx:{t:-20,c:10},f:'deon',why:'La transparencia duele, pero sostiene la confianza.',later:[4,'corrup_bien']},
  {l:'Destituirlo en silencio',fx:{t:-10,c:3},f:'util',why:'Resuelves el problema sin escándalo, pero nadie aprende nada.',later:[4,'corrup_filtra',.5]},
  {l:'No hacer nada',fx:{c:-3,se:3},f:'real',why:'El silencio también es una decisión, y cuesta.',later:[3,'corrup_mal']}]},
 {id:'epidemia',st:1,e:'🦠',title:'Brota una epidemia',text:'La fiebre se extiende por los barrios más pobres.',opts:[
  {l:'Atención gratuita para todos',fx:{t:-60,p:-2,c:6},f:'deon',why:'La vida no tiene precio de mercado.'},
  {l:'Atender a quien pueda pagar',fx:{t:20,p:-6,e:-8,sc:-8},f:'real',why:'El tesoro se salva; la desigualdad decide quién vive.',later:[3,'epidemia_mal']},
  {l:'Vacunar primero a los trabajadores',fx:{t:-30,p:-3,e:-2,sa:4},f:'util',why:'Proteges la economía de todos, aunque no a todos por igual.'}]},
 {id:'elite',st:1,e:'🧳',title:'La élite amenaza con irse',text:'Dicen que tus impuestos los ahogan y que se llevarán su capital.',cond:()=>S.tx.e>=28,opts:[
  {l:'Bajarles el impuesto',fx:{txe:-10,se:12,e:-5},f:'util',why:'Retienes la inversión, pero el esfuerzo fiscal recae en otros.'},
  {l:'Mantener la tasa',fx:{se:-10,c:4,sc:3},f:'deon',why:'Las reglas no se negocian bajo amenaza.'},
  {l:'Pactar inversión social a cambio',fx:{se:-6,t:25,sc:4},f:'virt',why:'Un punto medio: el capital se queda y devuelve algo.'}]},
 {id:'precios',st:1,e:'📈',title:'Los precios suben sin control',text:'El pan cuesta cada semana más. La gente culpa al gobierno.',cond:()=>S.infl>.08,opts:[
  {l:'Congelar precios por decreto',fx:{i:-3,se:-6,sc:5,sa:-3},f:'real',why:'Alivio inmediato, pero ocultas el síntoma sin curar la causa.'},
  {l:'Recortar el gasto público',fx:{i:-5,sc:-6,sa:-6,t:30},f:'util',why:'Enfrías la economía: duele hoy, estabiliza mañana.'},
  {l:'Explicar la situación y esperar',fx:{c:3,sc:-6,sa:-6},f:'virt',why:'La honestidad no baja los precios.'}]},
 {id:'oro',st:2,e:'✨',title:'Hallan oro en la montaña',text:'Llegan compradores de fuera ofreciendo inversión.',cond:()=>countT('montana')>0,opts:[
  {l:'Explotar a gran escala',fx:{t:150,a:-18,e:-5,se:8},f:'util',why:'Mucha riqueza hoy; mucho daño para mañana.',later:[4,'oro_mal']},
  {l:'Explotar con control ambiental',fx:{t:45,a:-5},f:'virt',why:'Ni todo ni nada: prudencia.'},
  {l:'Declarar reserva natural',fx:{a:8,c:3,se:-4},f:'deon',why:'Hay bienes que no deberían tener precio.'}]},
 {id:'protesta',st:2,e:'📣',title:'Protesta estudiantil',text:'Los jóvenes exigen educación superior accesible.',opts:[
  {l:'Dialogar y subsidiar',fx:{t:-50,c:8,e:5},f:'contr',why:'Abrir oportunidades a quien no las tiene es justicia.'},
  {l:'Mesa de diálogo sin dinero',fx:{c:1,sa:-4},f:'virt',why:'Escuchar es necesario, pero no siempre suficiente.'},
  {l:'Dispersarla con la guardia',fx:{c:-15,sa:-6,sc:-4,se:5},f:'real',why:'El orden se impone, la legitimidad se pierde.',later:[5,'protesta_mal']}]},
 {id:'prestamo',st:2,e:'🌐',title:'Un banco extranjero ofrece crédito',text:'Te entregan 250 de oro, pero deberás 300 (incluye comisión) más intereses.',opts:[
  {l:'Aceptar',fx:{t:250,d:300},f:'util',why:'Liquidez inmediata. Revisa si tu flujo de caja soporta la cuota.'},
  {l:'Rechazar',fx:{},f:'virt',why:'Crecer con lo propio es más lento y más seguro.'}]},
 {id:'alianza',st:2,e:'🤝',title:'El pueblo vecino propone una alianza',text:'Quieren comerciar sin aranceles durante años.',opts:[
  {l:'Aceptar en igualdad',fx:{t:40,c:3,sa:4,sc:-5},f:'contr',why:'Un acuerdo justo es el que ambas partes aceptarían.'},
  {l:'Exigir ventajas',fx:{t:90,c:-4,se:4,sc:-5},f:'real',why:'Sacas provecho de tu posición de fuerza.',later:[4,'alianza_rota',.5]}]},
 {id:'progresivo',st:3,e:'⚖️',title:'Proponen un impuesto de solidaridad',text:'Un aporte único de quienes más tienen para obras sociales.',opts:[
  {l:'Aprobarlo por decreto',fx:{e:10,se:-12,t:60},f:'contr',why:'Las desigualdades solo se justifican si benefician a los peores situados.'},
  {l:'Rechazarlo',fx:{e:-4,c:-3,se:5},f:'real',why:'Mantienes contentas a las élites.'},
  {l:'Convocar consulta popular',fx:{c:8,e:5,se:-5,t:-20},f:'virt',why:'Por el pueblo y con el pueblo: la deliberación también educa.'}]}
];
const LATER = {
 crecida_mal:{e:'🌊',title:'El río vuelve a crecer',text:'Esta vez los daños son mayores: nadie reforzó la orilla.',fx:{p:-5,f:-15,c:-8},why:'Ahorrar en prevención suele salir más caro después.'},
 diques:{e:'🧱',title:'Los diques resisten',text:'Llega una creciente fuerte, y los diques que construiste salvan las cosechas, aunque alteraron el cauce.',fx:{f:20,c:6,a:-4},why:'La inversión pública bien hecha paga dividendos que no siempre se ven.'},
 evasion2:{e:'📜',title:'Otros también dejan de pagar',text:'Tras tu perdón, más terratenientes evaden impuestos.',fx:{t:-60,c:-6,e:-4},why:'Una excepción se vuelve regla cuando la ley no se aplica.'},
 migra_bien:{e:'🧵',title:'Las familias acogidas prosperan',text:'Abrieron talleres y hoy pagan impuestos.',fx:{t:40,sa:6},why:'Acoger también es invertir.'},
 migra_mal:{e:'🚫',title:'Te pagan con la misma moneda',text:'Otra región cierra su comercio con la tuya.',fx:{t:-30,sa:-5},why:'El trato que das define el trato que recibes.'},
 oro_mal:{e:'☠️',title:'El río baja envenenado',text:'El mercurio de la mina llegó al agua.',fx:{a:-15,p:-4,sc:-8},why:'La riqueza extractiva cobra su factura años después.'},
 corrup_mal:{e:'🏃',title:'El tesorero huye',text:'Se fue con parte del tesoro.',fx:{t:-100,c:-10},why:'La impunidad crece si nadie la enfrenta.'},
 corrup_bien:{e:'🤝',title:'La honestidad atrae inversión',text:'Comerciantes de fuera confían en tu gobierno.',fx:{t:50,se:5},why:'La confianza institucional es un activo económico.'},
 maestros_bien:{e:'🎓',title:'Los primeros bachilleres',text:'Una generación mejor formada entra a trabajar.',fx:{e:6,sa:6,sc:4},why:'La educación es la inversión de más largo plazo.'},
 humo_mal:{e:'🤒',title:'Enferman los pescadores',text:'El agua contaminada pasó factura.',fx:{p:-4,c:-8,sc:-6},why:'Las externalidades no desaparecen: se trasladan a otros.'},
 sal_mal:{e:'🧂',title:'El precio de la sal se dispara',text:'El monopolista abusa de su posición.',fx:{i:3,sc:-6,sa:-6},why:'Sin competencia, el precio lo decide el más fuerte.'},
 protesta_mal:{e:'✊',title:'La oposición crece',text:'Los jóvenes que reprimiste hoy lideran la oposición.',fx:{c:-12},why:'La represión aplaza los conflictos, no los resuelve.'},
 epidemia_mal:{e:'🦠',title:'Rebrote en los barrios pobres',text:'Quienes no pudieron pagar atención contagiaron a otros.',fx:{p:-5,e:-4,sc:-5},why:'La salud de todos depende de la salud de los más pobres.'},
 donante_mal:{e:'🎩',title:'La familia donante exige favores',text:'Quieren contratos públicos sin licitación.',fx:{c:-6,e:-3,se:5},why:'En política, nada es gratis.'},
 tierras_mal:{e:'🔥',title:'Invasiones de tierra',text:'Los campesinos sin tierra ocupan haciendas.',fx:{sc:-5,se:-10,c:-8},why:'Las demandas ignoradas buscan otros caminos.'},
 evasion_venganza:{e:'🗞️',title:'El terrateniente financia a tu oposición',text:'No perdonó la multa: ahora paga periódicos contra tu gobierno.',fx:{c:-7},why:'Aplicar la ley tiene costos políticos; aplicarla igual es lo que la hace ley.'},
 reforma_fuga:{e:'💼',title:'Los hacendados sacan su capital',text:'Tras la reforma agraria, parte de la élite invierte en otra región.',fx:{se:-6,t:-40},why:'Toda redistribución tiene perdedores que reaccionan.'},
 corrup_filtra:{e:'📰',title:'Se filtra el encubrimiento',text:'Un periodista revela que despediste al tesorero sin investigarlo.',fx:{c:-9},why:'Lo que se oculta suele salir a la luz, y peor.'},
 alianza_rota:{e:'💔',title:'El vecino rompe la alianza',text:'Cansado de condiciones abusivas, cierra el comercio.',fx:{t:-50,sa:-5},why:'Los acuerdos injustos son frágiles.'},
 huelga_mal:{e:'🔧',title:'Sabotaje en los talleres',text:'El resentimiento tras la huelga rota se hace sentir.',fx:{t:-40,sa:-6},why:'Ganar por la fuerza deja cuentas pendientes.'}
};

const DIFFS={
  facil:{n:'Fácil',gold:200,good:1.15,bad:.8,sat:4,polis:5,elec:45,evp:.6,exp:.2,reward:30,d:'Más oro al inicio y dilemas menos duros. Sostén la Polis 5 años.'},
  normal:{n:'Normal',gold:150,good:1,bad:1.2,sat:-3,polis:6,elec:52,evp:.75,exp:.45,reward:20,d:'Exigente: los errores se pagan. Sostén la Polis 6 años; las elecciones piden confianza de 52.'},
  dificil:{n:'Difícil',gold:110,good:.9,bad:1.35,sat:-5,polis:8,elec:55,evp:.85,exp:.5,reward:0,d:'Poco oro, dilemas duros y un pueblo muy exigente. Sostén la Polis 8 años; las elecciones piden confianza de 55. La guía no da recompensas.'}
};
function D(){return DIFFS[S.diff||'normal']}
const GUIDE=[
  {t:'Construye un mercado: da empleo a artesanos y cobra tasas.',ok:c=>c.mercado>=1},
  {t:'Construye más casas para que llegue gente (4 en total).',ok:c=>c.casa>=4},
  {t:'Pon un tercer cultivo, mejor junto al río.',ok:c=>c.cultivo>=3},
  {t:'Revisa la Hacienda y termina tu tercer año de gobierno.',ok:()=>S.year>=4},
  {t:'Llega a 40 habitantes para convertirte en Pueblo.',ok:()=>S.stage>=1},
  {t:'Construye una escuela: el pueblo ya la espera.',ok:c=>c.escuela>=1}
];
function checkGuide(){
  if(!S.guide||S.gstep>=GUIDE.length)return null;
  if(GUIDE[S.gstep].ok(counts())){const r=D().reward;S.gold+=r;S.gstep++;return r?`Meta cumplida: +${r} de oro.`:'Meta cumplida.'}
  return null;
}
const REG={
  monarquia:{n:'Monarquía',t:'Monarca',rect:true,cor:'tirania',cyc:'tirania',col:'#5B3A7A',
    d:'Gobierna uno, para el bien de todos. La corona da estabilidad y la nobleza la respalda, pero el poder sin contrapesos tiende a corromperse, no hay elecciones y la sucesión es una lotería.',
    m:{tr:2,se:5,admin:1,drift:1.6}},
  aristocracia:{n:'Aristocracia',t:'Príncipe del Senado',rect:true,cor:'oligarquia',cyc:'oligarquia',col:'#2F5B45',
    d:'Gobiernan los mejores. Administración eficiente y experta, pero el Senado solo permite mover cada impuesto 5 puntos por año.',
    m:{se:6,sa:2,admin:.8,taxStep:5,drift:.8}},
  republica:{n:'República democrática',t:'Presidente',rect:true,cor:'demagogia',cyc:'demagogia',col:'#2D5D72',
    d:'Gobiernan muchos, con leyes y libertades. Máxima legitimidad, pero hay elecciones cada 4 años desde que eres Pueblo y la administración es más costosa.',
    m:{tr:4,sc:2,sa:3,admin:1.05,elect:true}},
  tirania:{n:'Dictadura',t:'Dictador',rect:false,cor:'tirania',cyc:'aristocracia',col:'#9E2B25',
    d:'Tiranía: uno gobierna para sí. Las protestas se silencian y el Estado es barato, pero la confianza cae y el descontento oculto termina en revolución.',
    m:{tr:-10,sc:-4,sa:-4,eq:-5,admin:.9,silence:true,drift:1}},
  oligarquia:{n:'Plutocracia',t:'Canciller',rect:false,cor:'oligarquia',cyc:'republica',col:'#6B5420',
    d:'Oligarquía: gobiernan los ricos para los ricos. La élite paga máximo 10% y está feliz; el pueblo se empobrece y la desigualdad crece.',
    m:{tr:-4,se:10,sc:-8,sa:-6,eq:-10,admin:1,eliteCap:10}},
  demagogia:{n:'Populismo',t:'Caudillo',rect:false,cor:'demagogia',cyc:'monarquia',col:'#C0602A',
    d:'Demagogia: se gobierna para el aplauso. El ánimo popular sube, pero el gasto dispara la inflación y la élite desconfía. Hay elecciones.',
    m:{sc:6,sa:6,se:-6,admin:1.2,infl:.02,elect:true}}
};
const CYCLE=['monarquia','tirania','aristocracia','oligarquia','republica','demagogia'];
function RG(){return REG[S.reg||'republica']}
function RM(k,d){const v=RG().m[k];return v===undefined?(d===undefined?0:d):v}
let S;
function rnd(n){return Math.floor(Math.random()*n)}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function idx(r,c){return r*N+c}
function neigh(i){const r=Math.floor(i/N),c=i%N,o=[];[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{const R=r+dr,C=c+dc;if(R>=0&&R<N&&C>=0&&C<N)o.push(idx(R,C))});return o}
function nearRiver(i){return neigh(i).some(j=>S.map[j].t==='rio')}
function countT(t){return S.map.filter(x=>x.t===t).length}
function cost(k){return Math.round(B[k].cost*S.price)}

function genMap(seed){
  const R=mulberry(seed),rn=n=>Math.floor(R()*n);
  let m=Array.from({length:N*N},()=>({t:'llano',b:null}));
  let col=Math.floor(N*.3)+rn(Math.floor(N*.35));
  for(let r=0;r<N;r++){
    m[idx(r,col)].t='rio';
    if(R()<.35){const nc=clamp(col+(R()<.5?-1:1),2,N-4);m[idx(r,nc)].t='rio';col=nc}
  }
  if(R()<.6){let row=Math.floor(N*.55)+rn(Math.floor(N*.3)),c=0;while(c<col){m[idx(row,c)].t='rio';if(R()<.3&&row>2&&row<N-2){row+=R()<.5?-1:1;m[idx(row,c)].t='rio'}c++}}
  const size=(2.5+R()*2)*N/12;
  for(let r=0;r<Math.ceil(N*.5);r++)for(let c=Math.floor(N*.45);c<N;c++){
    if(m[idx(r,c)].t==='llano'&&r+(N-1-c)<size+R()*2.5)m[idx(r,c)].t='montana';
  }
  const lakes=R()<.5?1:0;
  for(let k=0;k<lakes;k++){const lr=Math.floor(N*.5)+rn(Math.floor(N*.3)),lc=rn(Math.floor(N*.2))+1;[[0,0],[0,1],[1,0],[1,1]].forEach(([a,b])=>{if(R()<.85)m[idx(lr+a,lc+b)].t='rio'})}
  const forests=Math.round((4+rn(3))*N*N/144);
  for(let k=0;k<forests;k++){
    const cr=rn(N),cc=rn(N);
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
      const r2=cr+dr,c2=cc+dc;
      if(r2>=0&&r2<N&&c2>=0&&c2<N&&m[idx(r2,c2)].t==='llano'&&R()<.65)m[idx(r2,c2)].t='bosque';
    }
  }
  // relieve: ruido suave, laderas cerca de las montañas, río en el fondo del valle
  const nz=Array.from({length:N*N},()=>R());
  for(let pass=0;pass<3;pass++)for(let i=0;i<N*N;i++){const r=Math.floor(i/N),c=i%N;let t=nz[i],n=1;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const r2=r+a,c2=c+b;if(r2>=0&&r2<N&&c2>=0&&c2<N){t+=nz[r2*N+c2];n++}});nz[i]=t/n}
  for(let i=0;i<N*N;i++){const x=m[i];const r=Math.floor(i/N),c=i%N;const nearM=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].some(([a,b])=>{const r2=r+a,c2=c+b;return r2>=0&&r2<N&&c2>=0&&c2<N&&m[r2*N+c2].t==='montana'});
    x.h=x.t==='rio'?0:x.t==='montana'?2:(nz[i]>.58?2:nz[i]>.47?1:0);if(nearM&&x.t!=='rio')x.h=Math.max(x.h,1)}
  for(let i=0;i<N*N;i++){if(m[i].t==='rio')continue;const r=Math.floor(i/N),c=i%N;if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const r2=r+a,c2=c+b;return r2>=0&&r2<N&&c2>=0&&c2<N&&m[r2*N+c2].t==='rio'}))m[i].h=Math.min(m[i].h,1)}
  // orientación: montañas a la derecha, a la izquierda o al fondo (nunca tapando el frente)
  const o=rn(3),out=Array.from({length:N*N});
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
    const [r2,c2]=o===0?[r,c]:o===1?[c,r]:[r,N-1-c];
    out[idx(r2,c2)]=m[idx(r,c)];
  }
  return out;
}
function freshState(diff,guide,seed,reg){
  seed=(seed===undefined||seed===null||seed==='')?Math.floor(Math.random()*899999)+100000:+seed;
  S={reg:reg||'republica',corr:REG[reg||'republica'].rect?20:60,tx0:null,regLog:[],diff:diff||'normal',guide:guide!==false,gstep:0,year:1,stage:0,gold:DIFFS[diff||'normal'].gold,debt:0,bonds:[],food:40,pop:15,tx:{c:10,a:12,e:15},
     sat:{c:62,a:62,e:62},hap:62,eq:50,tr:55,env:70,price:1,infl:.02,issue:0,shock:0,rev:13,
     laws:{},seed,undo:[],kept:0,hungry:false,vis:null,deficit:0,defaults:0,eliteMood:1,map:genMap(seed),log:[],hist:[],
     phil:{util:0,deon:0,contr:0,real:0,virt:0},promises:[],later:[],polisYears:0,recent:[],pend:null,over:false};
  const riv=S.map.map((x,i)=>i).filter(i=>S.map[i].t==='llano'&&nearRiver(i));
  const R0=mulberry(seed+1);const start=riv[Math.floor(R0()*riv.length)];
  S.map[start].b='cultivo';
  const want=['cultivo','casa','casa'];
  const q=[start],seen=new Set([start]);
  while(q.length&&want.length){
    const i=q.shift();
    for(const j of neigh(i)){
      if(seen.has(j))continue;seen.add(j);
      if(want.length&&S.map[j].t==='llano'&&!S.map[j].b){S.map[j].b=want.shift()}
      q.push(j);
    }
  }
  S.log.unshift({y:1,t:'Quince personas fundan una aldea junto al río. Te eligen para gobernar.'});
}

function counts(){const c={};Object.keys(B).forEach(k=>c[k]=0);S.map.forEach(x=>{if(x.b)c[x.b]++});return c}
function cap(){return counts().casa*10}
function totDebt(){return S.debt+S.bonds.reduce((a,b)=>a+b.amt,0)}
function rating(){
  const score=clamp(100-totDebt()/Math.max(20,S.rev)*8-S.deficit*12-Math.max(0,S.infl-.03)*300+(S.tr-50)*.4-S.defaults*25,0,100);
  const r=RAT.find(x=>score>=x[0]);return {score,l:r[1],sp:r[2]};
}
function loanRate(){return clamp(.05+rating().sp-counts().banco*.02,.03,.3)}
function canBorrow(){return S.stage>=1&&rating().l!=='CCC'}

function energy(c){return (S.stage>=1?1:0)+c.molino*3}
function poweredT(c){return S.stage>=1?Math.min(c.taller,energy(c)):c.taller}
function waterCap(c){return S.stage>=1?40+c.acueducto*70:9999}
function hasLaw(k){return !!(S.laws&&S.laws[k])}
function society(){
  const c=counts(),P=S.pop;
  let el=Math.round((2+c.mercado*.5+poweredT(c)*1.5+c.mina*2+c.banco*3+c.puerto*1.5+c.cafetal*.3)*S.eliteMood);
  el=clamp(el,P>=5?1:0,Math.floor(P*.2));
  const W=P-el,jc=c.cultivo*7+c.cafetal*6;
  let ja=0;Object.keys(B).forEach(k=>{if(k!=='taller')ja+=(B[k].ja||0)*c[k]});ja+=poweredT(c)*9;
  let camp,art,un;
  if(W>=jc+ja){camp=jc;art=ja;un=W-jc-ja}
  else{const t=jc+ja;camp=t?Math.round(W*jc/t):0;art=W-camp;un=0}
  return {el,camp,art,un,jc,ja,P};
}
function finance(){
  const c=counts(),so=society(),w=S.price*(1+.1*c.universidad)*(hasLaw('jornada')?.95:1);
  const inc={c:so.camp*4*w,a:so.art*7*w,e:so.el*25*w,u:so.un*w};
  const taxC=Math.round(inc.c*S.tx.c/100),taxA=Math.round(inc.a*S.tx.a/100),taxE=Math.round(inc.e*S.tx.e/100);
  let fee=0,up=0;S.map.forEach(x=>{if(x.b){fee+=B[x.b].fee||0;up+=B[x.b].up}});
  fee=Math.round(fee*S.price*(hasLaw('ambiente')?.75:1)*(hasLaw('arancel')?1.2:1));up=Math.round(up*S.price);
  const lawCost=Math.round(((hasLaw('educacion')?S.pop*.15:0)+(hasLaw('subsidio')?so.camp*.8:0))*S.price);
  const admin=Math.round(S.pop*(.1+.12*S.stage)*(1+S.year*.01)*S.price*RM('admin',1));
  const rate=loanRate(),interest=Math.round(S.debt*rate);
  const pay=Math.min(S.debt+interest,Math.ceil((S.debt+interest)*.15));
  let cpn=0,mat=0;S.bonds.forEach(b=>{cpn+=Math.round(b.amt*b.cpn);if(b.due<=S.year)mat+=b.amt});
  const rev=taxC+taxA+taxE+fee,net=rev-up-admin-lawCost-pay-cpn-mat;
  let fcap=0;S.map.forEach((x,i)=>{if(x.b==='cultivo')fcap+=nearRiver(i)?16:12});
  const fprod=so.jc?Math.round(fcap*so.camp/so.jc):0,cons=Math.ceil(S.pop*.5);
  const post={c:inc.c*(1-S.tx.c/100),a:inc.a*(1-S.tx.a/100),e:inc.e*(1-S.tx.e/100),u:inc.u};
  return {so,taxC,taxA,taxE,fee,up,admin,lawCost,interest,pay,cpn,mat,rev,net,fprod,cons,post,rate};
}
function envTarget(c){return (hasLaw('ambiente')?12:0)+62+Math.min(20,c.parque*4)+countT('bosque')*.6-c.taller*7-c.mina*12-c.cultivo*1.5-c.casa*.4}
function satTargets(c,hunger){
  const P=Math.max(1,S.pop),so=society(),ur=so.un/Math.max(1,so.P),ip=S.infl*100;
  const sc=S.stage>=1?Math.min(1,c.escuela*50/P):.8,hc=S.stage>=1?Math.min(1,c.hospital*60/P):.8;
  const cov=(sc+hc)*8;
  const expc=S.stage>=1?Math.max(0,Math.min(20,S.year*D().exp)-(c.universidad*5+c.agora*3+Math.min(6,c.parque*1.5))):0;
  const ds=D().sat;
  const wc=waterCap(c),thirst=S.pop>wc?Math.min(25,(S.pop-wc)/Math.max(1,wc)*60):0;
  const L=k=>hasLaw(k)?1:0;
  return {sc,expc,thirst,
    c:RM('sc')+48+0-(S.tx.c-10)*2+(hunger?-20:5)+cov-ur*30-ip*1.5+(S.eq-50)*.2+(S.env<35?-8:0)-expc+ds+(L('educacion')*3+L('subsidio')*10-thirst),
    a:RM('sa')+48-(S.tx.a-12)*1.8+cov+Math.min(8,c.parque*2)-ur*30-ip*1.5+(S.eq-50)*.1+(S.env<35?-8:0)-expc+ds+(L('educacion')*3+L('jornada')*8+L('arancel')*3-thirst),
    e:58-(S.tx.e-15)*1.4+c.banco*4-(S.eq-50)*.1-ip+ds+RM('se')-(L('jornada')*6+L('ambiente')*4+L('arancel')*3)};
}
function calcHap(so){
  so=so||society();const P=Math.max(1,S.pop);
  return clamp((so.camp*S.sat.c+(so.art+so.un)*S.sat.a+so.el*S.sat.e)/P-so.un/P*15,0,100);
}
function applyFx(fx0){
  const fx={};for(const [k,v] of Object.entries(fx0)){const bad=(k==='d'||k==='i')?v>0:k==='txe'?false:v<0;fx[k]=k==='txe'?v:Math.round(v*(bad?D().bad:D().good))}
  if(fx.t)S.gold+=fx.t;
  if(fx.f)S.food=Math.max(0,S.food+fx.f);
  if(fx.p)S.pop=clamp(S.pop+fx.p,1,Math.max(1,cap()));
  if(fx.h){S.sat.c=clamp(S.sat.c+fx.h,0,100);S.sat.a=clamp(S.sat.a+fx.h,0,100);S.sat.e=clamp(S.sat.e+fx.h,0,100)}
  if(fx.sc)S.sat.c=clamp(S.sat.c+fx.sc,0,100);
  if(fx.sa)S.sat.a=clamp(S.sat.a+fx.sa,0,100);
  if(fx.se)S.sat.e=clamp(S.sat.e+fx.se,0,100);
  if(fx.e)S.eq=clamp(S.eq+fx.e,0,100);
  if(fx.c)S.tr=clamp(S.tr+fx.c,0,100);
  if(fx.a)S.env=clamp(S.env+fx.a,0,100);
  if(fx.d)S.debt=Math.max(0,S.debt+fx.d);
  if(fx.i)S.shock+=fx.i/100;
  if(fx.txe)S.tx.e=clamp(S.tx.e+fx.txe,0,50);
  S.hap=calcHap();
  return fx;
}

// Avanza un año. Devuelve {stageUp, end:{win,title,text}|null}
function advance(){
  S.undo=[];
  const c=counts(),F=finance(),so=F.so,p0=S.pop,news=[];
  S.debt=Math.max(0,S.debt+F.interest-F.pay);
  if(F.mat)news.push(`Venció un bono: pagaste ${F.mat} de capital.`);
  S.bonds=S.bonds.filter(b=>b.due>S.year);
  S.gold+=F.net;S.rev=F.rev;
  S.food+=F.fprod-F.cons;
  let hunger=false;
  if(S.stage>=1&&S.pop>waterCap(c))news.push(`Falta agua: ${S.pop} habitantes y acueductos para ${waterCap(c)}.`);
  if(S.food<0){hunger=true;S.hungry=true;S.pop-=Math.ceil(S.pop*.12);S.food=0;news.push('Faltó alimento: hubo hambre y se perdieron vidas.')}
  const cp=c.casa*10;
  const wcap=waterCap(c);
  if(!hunger&&S.pop<cp&&S.pop<wcap)S.pop=Math.min(cp,S.pop+Math.max(1,Math.round(S.pop*.18*S.hap/60)));
  if(S.pop>cp)S.pop=cp;
  if(S.hap<25){S.pop-=Math.ceil(S.pop*.06);news.push('El descontento empuja a familias a irse.')}
  S.pop=Math.max(0,S.pop);
  // inflación
  const tI=.02+RM('infl')+(hasLaw('bancoCentral')?-.015:0)+(hasLaw('arancel')?.005:0)+S.issue/Math.max(50,F.rev)*.25+(S.gold<0?.03:0)+(hunger?.04:0)-c.banco*.01+S.shock;
  S.infl=clamp(S.infl*.4+tI*.6,-.02,.6);S.shock*=.5;S.issue=0;S.price*=1+S.infl;
  if(S.infl>.08)news.push(`La inflación llegó a ${Math.round(S.infl*100)}%.`);
  // satisfacción por clase
  const TG=satTargets(c,hunger),tSC=TG.c,tSA=TG.a,tSE=TG.e,sc=TG.sc,expc=TG.expc,ip=S.infl*100;
  S.sat.c=clamp(S.sat.c+(tSC-S.sat.c)*.35,0,100);
  S.sat.a=clamp(S.sat.a+(tSA-S.sat.a)*.35,0,100);
  S.sat.e=clamp(S.sat.e+(tSE-S.sat.e)*.35,0,100);
  const so2=society();
  S.hap=calcHap(so2);
  if(S.sat.e<25){S.eliteMood=Math.max(.4,S.eliteMood-.3);news.push('Fuga de capitales: parte de la élite se va con su dinero.')}
  else if(S.sat.e>45)S.eliteMood=Math.min(1,S.eliteMood+.1);
  // igualdad
  const tot=(F.post.c+F.post.a+F.post.e+F.post.u)||1,es=F.post.e/tot,ps=so.el/Math.max(1,so.P);
  const tE=85-(es-ps)*120+sc*10+c.universidad*5+RM('eq')+(hasLaw('educacion')?8:0)+(hasLaw('censura')?-3:0);
  S.eq=clamp(S.eq+(tE-S.eq)*.3,0,100);
  // confianza
  const tT=50+RM('tr')+(hasLaw('censura')?6:0)+(hasLaw('prensa')?-3:0)+(S.hap-50)*.4+c.agora*10+(S.gold<0?-10:0)-Math.max(0,ip-3)*.8;
  S.tr=clamp(S.tr+(tT-S.tr)*.3,0,100);
  if(S.sat.c<25||S.sat.a<25){if(RM('silence',false)){S.corr=clamp(S.corr+4,0,100);news.push('La guardia disolvió protestas. Nadie habla, pero el descontento crece.')}else{S.tr=clamp(S.tr-5,0,100);news.push(S.sat.c<25?'Protestas campesinas en los caminos.':'Protestas de artesanos en la plaza.')}}
  // ambiente
  const tA=envTarget(c);
  S.env=clamp(S.env+(tA-S.env)*.3,0,100);
  // déficit y cesación de pagos
  S.deficit=F.net<0?S.deficit+1:0;
  if(F.net<0)news.push(`El presupuesto cerró con déficit de ${-F.net} de oro.`);
  if(S.gold<0&&S.deficit>=2){S.tr=clamp(S.tr-8,0,100);news.push('Años en rojo: el pueblo duda de tu manejo.')}
  if(S.gold<-150){
    S.defaults++;
    if(S.defaults>=2){S.log.unshift({y:S.year,t:news.join(' ')});return {end:{win:false,title:'Bancarrota',text:'Segunda cesación de pagos. Nadie vuelve a prestarle al territorio.'}}}
    S.debt=Math.round(S.debt/2);S.bonds.forEach(b=>b.amt=Math.round(b.amt/2));S.gold=0;S.tr=clamp(S.tr-20,0,100);
    S.sat.c-=10;S.sat.a-=10;S.sat.e-=15;
    news.push('Cesación de pagos: reestructuraste la deuda a la mitad. Tu calificación se desploma.');
  }
  // promesas
  S.promises=S.promises.filter(pr=>{
    if(counts()[pr.k]>pr.base){S.kept++;S.corr=clamp(S.corr-5,0,100);S.tr=clamp(S.tr+8,0,100);S.sat.c+=4;S.sat.a+=4;news.push(`Cumpliste tu promesa: ${B[pr.k].a}. El pueblo lo celebra.`);return false}
    if(S.year>=pr.dl){S.corr=clamp(S.corr+8,0,100);S.tr=clamp(S.tr-15,0,100);news.push(`Promesa incumplida: no construiste ${B[pr.k].a}.`);return false}
    return true;
  });
  const d=S.pop-p0;
  if(d>0)news.push(`Llegaron ${d} habitantes.`);else if(d<0)news.push(`La población bajó en ${-d}.`);
  let stageUp=false;const nx=STAGES[S.stage+1];
  if(nx&&nx.ok(counts())){S.stage++;stageUp=true;news.push(`El territorio ahora es ${STAGES[S.stage].n}.`)}
  if(RM('elect',false)&&S.stage>=1&&S.stage<3&&S.year%4===0){
    const th=34;if(S.tr<th){S.log.unshift({y:S.year,t:news.join(' ')});return {end:{win:false,title:'Perdiste las elecciones',text:`El pueblo votó por otro proyecto: la confianza estaba en ${Math.round(S.tr)} y necesitabas ${th}.`}}}
    news.push('Hubo elecciones y el pueblo renovó tu mandato.');S.tr=clamp(S.tr+3,0,100);
  }
  if(S.stage===3){
    S.polisYears++;
    if(!stageUp&&S.polisYears%4===0&&!RM('elect',false)&&S.tr<D().elec){
      S.polisYears=0;S.corr=clamp(S.corr+20,0,100);S.tr=clamp(S.tr-5,0,100);
      news.push(`El pueblo niega su apoyo al ${RG().t.toLowerCase()}: sin elecciones, la legitimidad se mide en la calle. La cuenta de años como Polis vuelve a cero.`);
    }
    if(!stageUp&&S.polisYears%4===0&&RM('elect',false)){
      if(S.tr<D().elec){S.log.unshift({y:S.year,t:news.join(' ')});return {end:{win:false,title:'Perdiste las elecciones',text:'El pueblo votó por otro proyecto. La confianza no alcanzó.'}}}
      S.tr=clamp(S.tr+5,0,100);news.push('Ganaste las elecciones: el pueblo renueva tu mandato.');
    }
  }
  // rumbo del gobierno: corrupción, reforma y revolución
  const minSat=Math.min(S.sat.c,S.sat.a,S.sat.e);
  S.corr=clamp(S.corr+RM('drift')+(hasLaw('censura')?1.5:0)-(hasLaw('prensa')?1.5:0),0,100);
  if(minSat<25)S.corr=clamp(S.corr+3,0,100);
  if(minSat>50&&S.tr>55)S.corr=clamp(S.corr-2,0,100);
  S.regChange=null;
  if(RG().rect&&S.corr>=70){const from=S.reg;S.reg=RG().cor;S.corr=45;S.regChange={type:'cor',from,to:S.reg};news.push(`El gobierno se corrompió: ${REG[from].n} se volvió ${REG[S.reg].n}.`)}
  else if(!RG().rect){
    const nx=RG().cyc;
    if(S.corr<=20){const from=S.reg;S.reg=Object.keys(REG).find(k=>REG[k].cor===from&&REG[k].rect)||nx;S.corr=35;S.regChange={type:'ref',from,to:S.reg};news.push(`Reformaste el gobierno: ${REG[from].n} vuelve a ser ${REG[S.reg].n}.`)}
    else if((S.tr<(S.reg==='tirania'?40:30)||minSat<22)&&Math.random()<(S.reg==='tirania'?.6:.45)){const from=S.reg;S.reg=nx;S.corr=25;S.tr=clamp(S.tr+15,0,100);S.gold=Math.round(S.gold*.6);S.pop=Math.round(S.pop*.92);if(S.stage===3)S.polisYears=0;['c','a','e'].forEach(k=>S.sat[k]=clamp(S.sat[k]+8,0,100));S.regChange={type:'rev',from,to:S.reg};news.push(`¡Revolución! Cae ${REG[from].n} y nace ${REG[S.reg].n}.`)}
  }
  if(S.reg==='monarquia'&&S.year%15===0){if(Math.random()<.5){S.corr=clamp(S.corr-10,0,100);S.tr=clamp(S.tr+5,0,100);news.push('Sucesión en la corona: el heredero es prudente y querido.')}else{S.corr=clamp(S.corr+15,0,100);S.tr=clamp(S.tr-5,0,100);news.push('Sucesión en la corona: el heredero es caprichoso y la corte murmura.')}}
  if(RM('eliteCap',0)&&S.tx.e>RM('eliteCap',0))S.tx.e=RM('eliteCap',0);
  S.tx0={...S.tx};
  S.expc=Math.round(expc);
  S.hist.push({y:S.year,pop:S.pop,gold:Math.round(S.gold),debt:Math.round(totDebt()),eq:Math.round(S.eq),hap:Math.round(S.hap),tr:Math.round(S.tr),env:Math.round(S.env),infl:+(S.infl*100).toFixed(1)});
  S.log.unshift({y:S.year,t:news.join(' ')||'Un año tranquilo.'});
  if(S.log.length>60)S.log.pop();
  if(S.tr<=5)return {end:{win:false,title:'Revuelta popular',text:'El pueblo perdió toda confianza y tomó la plaza.'}};
  if(S.env<=5)return {end:{win:false,title:'Colapso ecológico',text:'El río y la tierra ya no sostienen la vida.'}};
  if(S.pop<=3)return {end:{win:false,title:'Territorio abandonado',text:'Las últimas familias se marcharon.'}};
  if(S.polisYears>=D().polis)return {end:{win:true,title:'Tu Polis perdura',text:`Sostuviste ${D().polis} años un gobierno del pueblo y para el pueblo.`}};
  if(S.vis&&S.vis.y<=S.year)S.vis=null;
  S.year++;
  if(!stageUp)S.pend=drawEvent();
  return {stageUp,end:null};
}

function drawEvent(){
  const due=S.later.findIndex(l=>l.y<=S.year);
  if(due>=0){
    const l=S.later.splice(due,1)[0],L=LATER[l.id];
    return {id:l.id,e:L.e,title:L.title,text:`${L.text} Es consecuencia de lo que decidiste en el año ${l.from}.`,followUp:true,
      opts:[{l:'Asumir las consecuencias',fx:L.fx,f:null,why:L.why}]};
  }
  if(S.year<3||Math.random()>D().evp)return null;
  if(S.stage>=1&&S.promises.length===0&&Math.random()<.2)return petition();
  const c=counts();
  const pool=EV.filter(e=>S.stage>=e.st&&(!e.cond||e.cond(c))&&!S.recent.includes(e.id));
  if(!pool.length)return null;
  const e=pool[rnd(pool.length)];
  S.recent.push(e.id);if(S.recent.length>7)S.recent.shift();
  return {id:e.id,e:e.e,title:e.title,text:e.text,opts:e.opts};
}
function petition(){
  const ks=['escuela','hospital','parque','mercado','agora','universidad'].filter(k=>B[k].st<=S.stage);
  const k=ks[rnd(ks.length)];
  return {id:'pet',e:'✍️',title:`El pueblo pide ${B[k].a}`,text:'Una asamblea de vecinos te entrega una petición firmada. Si lo prometes, tendrás 3 años para cumplir.',opts:[
    {l:'Prometerlo',fx:{c:6},f:'deon',why:'Una promesa pública obliga. Cumplirla construye confianza; romperla la destruye.',promise:k},
    {l:'Explicar que ahora no hay recursos',fx:{c:-5,sc:-2,sa:-2},f:'virt',why:'La franqueza cuesta un poco hoy, pero no hipoteca tu palabra.'},
    {l:'Ignorar la petición',fx:{c:-8,sc:-3,sa:-3},f:'real',why:'Gobernar sin escuchar es gobernar en nombre del pueblo, no para él.'}]};
}
const VIS={crecida:[['flood'],['flood'],['flood']],crecida_mal:[['flood']],sequia:[['drought'],['drought'],['drought']],
  festival:[['festival'],['festival'],null],protesta:[['crowd'],['crowd'],['crowd']],huelga:[['crowd'],['crowd'],['crowd']],
  tierras_mal:[['crowd']],protesta_mal:[['crowd']],humo:[null,null,['smog']],humo_mal:[['smog']],plaga:[['pests'],null,['pests']],
  oro_mal:[['poison']],pet:[['crowd'],null,['crowd']],precios:[['crowd'],null,['crowd']]};
function choose(i){
  const ev=S.pend,o=ev.opts[i];
  const vv=VIS[ev.id]&&VIS[ev.id][i];if(vv)S.vis={k:vv[0],y:S.year};
  const real=applyFx(o.fx);if(o.f){S.phil[o.f]++;S.corr=clamp(S.corr+(o.f==='real'?9:o.f==='util'?1:-4),0,100)}
  if(o.promise)S.promises.push({k:o.promise,base:counts()[o.promise],dl:S.year+3});
  if(o.later&&(o.later[2]===undefined||Math.random()<o.later[2]))S.later.push({y:S.year+o.later[0],id:o.later[1],from:S.year});
  S.log.unshift({y:S.year,t:ev.followUp?`${ev.title}.`:`${ev.title}. Decidiste: ${o.l.toLowerCase()}.`});
  S.pend=null;return Object.assign({},o,{fx:real});
}
// acciones financieras
function takeLoan(){if(!canBorrow())return false;S.gold+=150;S.debt+=150;return true}
function payDebt(){const p=Math.min(50,S.debt,Math.floor(S.gold));S.gold-=p;S.debt-=p;return p}
function issueBond(){if(!canBorrow())return false;const cpn=Math.max(.02,loanRate()-.015);S.bonds.push({amt:200,cpn,due:S.year+5});S.gold+=200;return cpn}
function printMoney(){if(S.stage<1||hasLaw('bancoCentral'))return false;S.gold+=50;S.issue+=50;return true}
function whyNot(k,i){
  const x=S.map[i],b=B[k];
  if(x.t==='rio')return 'No se puede construir sobre el río.';
  if(x.b)return 'Esa casilla ya está ocupada.';
  if(!b.ok.includes(x.t))return `${b.n}: ese terreno no sirve.`;
  if(b.hmin&&(x.h||0)<b.hmin)return `${b.n}: necesita ladera (terreno alto).`;
  if(b.river&&!nearRiver(i))return `${b.n}: debe estar junto al río.`;
  if(S.gold<cost(k))return `Te faltan ${cost(k)-Math.floor(S.gold)} de oro.`;
  return '';
}
function undoBuild(){
  const u=S.undo.pop();if(!u)return null;const x=S.map[u.i];x.b=null;S.gold+=u.paid;
  if(u.forest){x.t='bosque';S.env=clamp(S.env+3,0,100)}
  if(S.pop>cap())S.pop=cap();return u;
}
function build(k,i){
  const r=whyNot(k,i);if(r)return r;
  const x=S.map[i];S.gold-=cost(k);
  let msg='';
  if(x.t==='bosque'){x.t='llano';S.env=clamp(S.env-3,0,100);msg='Talaste bosque: el ambiente baja.'}
  S.undo.push({i,k,paid:cost(k),forest:x.t==='llano'&&!!msg});
  x.b=k;return msg||true;
}

const ACH=[
  {id:'pueblo',n:'Primeros pasos',d:'Convierte la aldea en Pueblo.',ok:()=>S.stage>=1},
  {id:'ciudad',n:'La ciudad crece',d:'Llega a Ciudad.',ok:()=>S.stage>=2},
  {id:'polis',n:'Nace la Polis',d:'Llega a Polis.',ok:()=>S.stage>=3},
  {id:'sindeuda',n:'Cuentas claras',d:'Llega a Polis sin deuda.',ok:()=>S.stage>=3&&totDebt()===0},
  {id:'igualdad',n:'Tierra de iguales',d:'Igualdad de 80 o más siendo Ciudad.',ok:()=>S.stage>=2&&S.eq>=80},
  {id:'verde',n:'Territorio verde',d:'Ambiente de 80 o más siendo Ciudad.',ok:()=>S.stage>=2&&S.env>=80},
  {id:'aaa',n:'Triple A',d:'Calificación AAA siendo Ciudad.',ok:()=>S.stage>=2&&rating().l==='AAA'},
  {id:'palabra',n:'Hombre de palabra',d:'Cumple 3 promesas al pueblo.',ok:()=>S.kept>=3},
  {id:'sinhambre',n:'Nadie pasa hambre',d:'Gobierna 30 años sin una sola hambruna.',ok:()=>S.year>=30&&!S.hungry},
  {id:'kant',n:'Gobierno kantiano',d:'Gana con la ética del deber como perfil.',ok:e=>e&&e.win&&topPhil()==='deon'},
  {id:'rawls',n:'Velo de ignorancia',d:'Gana con la justicia como equidad como perfil.',ok:e=>e&&e.win&&topPhil()==='contr'},
  {id:'maquiavelo',n:'El príncipe',d:'Gana con el realismo político como perfil.',ok:e=>e&&e.win&&topPhil()==='real'},
  {id:'fenix',n:'Ave fénix',d:'Gana después de una cesación de pagos.',ok:e=>e&&e.win&&S.defaults>0},
  {id:'dificil',n:'Estadista',d:'Gana en Difícil.',ok:e=>e&&e.win&&S.diff==='dificil'}
];
function topPhil(){return Object.keys(S.phil).sort((a,b)=>S.phil[b]-S.phil[a])[0]}

const ADV={
  rosa:{n:'Doña Rosa',r:'Lideresa campesina',k:'sc',sat:'c',
    pro:['Por fin alguien mira hacia el campo.','Así sí. La tierra se lo va a agradecer.'],con:['Otra vez el campo paga los platos rotos.','Los campesinos no olvidamos, gobernante.'],
    mood:['El campo está cansado de promesas.','Vamos bien, pero cuide la cosecha.','El campo está contento con usted.']},
  julian:{n:'Julián',r:'Maestro artesano',k:'sa',sat:'a',
    pro:['Los talleres respiran con esta decisión.','Eso es respeto por el trabajo.'],con:['Los artesanos no vamos a aguantar esto callados.','Con esto no alcanza para el pan.'],
    mood:['En los talleres se habla de huelga.','Hay trabajo, pero la plata no rinde.','Da gusto trabajar en este pueblo.']},
  aurelio:{n:'Don Aurelio',r:'Hacendado',k:'se',sat:'e',
    pro:['Una decisión sensata. El capital sabrá corresponder.','Así se gobierna, con cabeza fría.'],con:['Mi dinero puede irse a otra región, no lo olvide.','Esto espanta la inversión, gobernante.'],
    mood:['Estoy pensando seriamente en irme.','Los negocios van, sin más.','Excelente clima para invertir.']}
};
function stance(a,fx){const v=(fx[ADV[a].k]||0)+(fx.h||0)+(a==='aurelio'&&fx.txe?-fx.txe:0);return v>1?1:v<-1?-1:0}

function taxLimit(k,v){
  let lo=0,hi=k==='e'?50:40;
  const st=RM('taxStep',99);if(S.tx0){lo=Math.max(lo,S.tx0[k]-st);hi=Math.min(hi,S.tx0[k]+st)}
  if(k==='e'&&RM('eliteCap',0))hi=Math.min(hi,RM('eliteCap',0));
  return clamp(v,lo,hi);
}
function seatName(){return {monarquia:'Palacio real',aristocracia:'Senado',republica:'Ágora',tirania:'Palacio de gobierno',oligarquia:'Bolsa',demagogia:'Balcón del pueblo'}[S.reg||'republica']}

const LAWS=[
  {id:'educacion',n:'Educación pública gratuita',d:'Sube igualdad y el ánimo de campesinos y artesanos. Cuesta oro por cada habitante.',st:0},
  {id:'subsidio',n:'Subsidio al campo',d:'Los campesinos ganan mucho ánimo. Cuesta oro por cada campesino.',st:0},
  {id:'jornada',n:'Jornada de 8 horas',d:'Artesanos más contentos; la élite protesta y la productividad baja 5%.',st:1},
  {id:'ambiente',n:'Protección ambiental',d:'El ambiente mejora mucho, pero tasas y regalías bajan 25% y la élite se molesta.',st:1},
  {id:'arancel',n:'Aranceles al comercio',d:'Tasas y comercio rinden 20% más y protegen al artesano; la élite comercial se molesta y los precios suben un poco.',st:1},
  {id:'prensa',n:'Libertad de prensa',d:'La prensa vigila: el rumbo mejora cada año, aunque las críticas bajan algo la confianza.',st:1,no:['tirania']},
  {id:'censura',n:'Censura',d:'Silencia las críticas: sube la confianza aparente, pero el rumbo se tuerce cada año.',st:1,no:['republica','demagogia']},
  {id:'bancoCentral',n:'Banco central independiente',d:'La inflación baja 1,5 puntos, pero ya no puedes imprimir moneda.',st:2}
];
function lawSlots(){return 1+S.stage}
function lawCostNow(){return Math.round(40*S.price)}
function lawBlock(l){
  if(l.st>S.stage)return `Se abre en ${STAGES[l.st].n}.`;
  if(l.no&&l.no.includes(S.reg))return `No es posible en ${RG().n}.`;
  if(!hasLaw(l.id)){
    if(Object.keys(S.laws).length>=lawSlots())return `Solo caben ${lawSlots()} leyes en esta etapa. Deroga una primero.`;
    if(S.gold<lawCostNow())return `Te faltan ${lawCostNow()-Math.floor(S.gold)} de oro.`;
    if(S.reg==='aristocracia'&&['jornada','ambiente','arancel'].includes(l.id)&&S.sat.e<45)return 'El Senado la rechaza: la élite está descontenta.';
    if(RM('elect',false)&&S.tr<40)return 'El Congreso no la aprueba: necesitas confianza de 40.';
  }
  return '';
}
function toggleLaw(id){
  const l=LAWS.find(x=>x.id===id),bl=lawBlock(l);if(bl)return bl;
  if(hasLaw(id)){delete S.laws[id];S.tr=clamp(S.tr-2,0,100);S.log.unshift({y:S.year,t:`Derogaste la ley: ${l.n}.`});return true}
  S.gold-=lawCostNow();if(S.reg!=='monarquia'&&S.reg!=='tirania')S.tr=clamp(S.tr-2,0,100);S.laws[id]=S.year;S.log.unshift({y:S.year,t:`Promulgaste la ley: ${l.n}.`});return true;
}

function freeTiles(k){return S.map.map((x,i)=>i).filter(i=>!whyNot(k,i))}
function tryBuild(k,pref){let t=freeTiles(k);if(pref)t=t.filter(pref).concat(t.filter(i=>!pref(i)));if(!t.length)return false;return build(k,t[0])===true||typeof build===''}
let ETH=null;
function botYear(strat){
  const c=counts(),F=finance(),so=F.so;
  const want=strat==='pop'?{c:5,a:6,e:12}:strat==='rich'?{c:18,a:20,e:10}:strat==='fair'?{c:8,a:10,e:25}:null;if(want)['c','a','e'].forEach(k=>S.tx[k]=taxLimit(k,want[k]));
  for(let n=0;n<8;n++){
    const c2=counts(),F2=finance();
    let k=null;
    if(F2.fprod-F2.cons<4&&S.food<40)k='cultivo';
    else if(F2.so.un>2&&F2.so.camp>=F2.so.jc&&F2.fprod-F2.cons<10)k='cultivo';
    else if(F2.so.un>3)k=(S.stage>=1&&strat!=='fair'&&c2.taller<3)?'taller':'mercado';
    else if(S.stage>=1&&S.pop>waterCap(c2)-15)k='acueducto';
    else if(S.stage>=1&&c2.taller>energy(c2))k='molino';
    else if(S.pop>=c2.casa*10-6)k='casa';
    else if(S.stage>=2&&c2.agora<1)k='agora';
    else if(S.stage>=1&&c2.hospital<1)k='hospital';
    else if(S.stage>=1&&c2.escuela*50<S.pop)k='escuela';
    else if(S.stage>=1&&c2.hospital*60<S.pop)k='hospital';
    else if(F2.so.un>2)k=(S.stage>=1&&strat!=='fair')?'taller':'mercado';
    else if(S.stage>=2&&c2.agora<1)k='agora';
    else if(S.env<40||(S.expc>4&&c2.parque<5))k='parque';
    else if(S.stage>=3&&S.expc>4&&c2.universidad<2&&S.gold>300)k='universidad';
    else if(S.stage>=3&&c2.universidad<1)k='universidad';
    if(!k)break;
    const pref=k==='cultivo'?(i=>nearRiver(i)):['casa','mercado','escuela','hospital','taller','agora','banco','universidad','parque'].includes(k)?(i=>!nearRiver(i)):null;
    let t=freeTiles(k);if(pref)t=t.filter(pref).concat(t.filter(i=>!pref(i)));
    if(!t.length)break;
    build(k,t[0]);
  }
  if(strat==='debt'&&S.gold<30&&canBorrow())takeLoan();
  const r=advance();
  if(S.pend){const o=S.pend.opts;let k=ETH?o.findIndex(x=>x.f===ETH):-1;if(k<0)k=rnd(o.length);choose(k)}
  return r;
}
const res={};const DIF=process.env.DIF||'normal';ETH=process.env.ETH||null;const NG=+process.env.NG||300;
for(const strat of ['pop','rich','fair','debt']){
  const out={win:0,end:{},stage:[0,0,0,0],years:[]};
  for(let g=0;g<NG;g++){
    freshState(DIF,false,null,process.env.REG||'republica');let r;
    for(let y=0;y<120;y++){r=botYear(strat);if(r.end)break}
    if(!r.end)out.end['sin fin']=(out.end['sin fin']||0)+1;
    else{out.end[r.end.title]=(out.end[r.end.title]||0)+1;if(r.end.win)out.win++}
    out.stage[S.stage]++;out.years.push(S.year);
    for(const v of [S.gold,S.pop,S.eq,S.tr,S.price])if(!isFinite(v))throw new Error('NaN '+strat);
  }
  out.avgYears=Math.round(out.years.reduce((a,b)=>a+b)/out.years.length);delete out.years;
  res[strat]=out;
}
console.log(JSON.stringify(res,null,1));
