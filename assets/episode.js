/* Pedagogical branch controller. No prices, optimization, economic model or API execution. */
(()=>{'use strict';
 const root=document.getElementById('episode');if(!root)return;
 const q=s=>root.querySelector(s),qa=s=>Array.from(root.querySelectorAll(s));
 const known=q('#episodeKnown'),gate=q('#episodeGate'),intent=q('#episodeIntent'),execution=q('#episodeExecution');
 let candidate='ROTATE',step=0;
 const stages=['Проверяем время доступности','Оцениваем состояние и совместный риск','Сопоставляем кандидатов','Проверяем полный допуск','Разделяем намерение и исполнение','Продолжаем единую книгу'];
 function render(){
  const available=known.value==='known';
  qa('[data-candidate]').forEach(b=>{b.disabled=!available;b.setAttribute('aria-pressed',String(available&&b.dataset.candidate===candidate));});
  gate.disabled=!available;const admitted=available&&gate.value==='admitted',trading=candidate!=='HOLD';
  intent.disabled=!admitted||!trading;if(intent.disabled)intent.value='draft';
  const recorded=admitted&&trading&&intent.value==='recorded';execution.disabled=!recorded;if(!recorded)execution.value='at_t';
  let state,message;
  if(!available){state='unavailable';message='Факт ещё недоступен к t. Он не меняет оценку на этом шаге. Последние допустимые сведения и обязательный контроль книги продолжают действовать.';}
  else if(gate.value==='proposed'){state='proposed';message='Выбран только кандидат. Его полный допуск ещё не показан, поэтому нового торгового намерения и исполнения нет.';}
  else if(gate.value==='rejected'){state='rejected';message='Кандидат отклонён. По нему не возникает новой сделки. Для других вариантов нужны собственные проверки; обязательный контроль портфеля продолжается.';}
  else if(gate.value==='unknown'){state='unknown';message='Допуск не установлен. Схема не превращает неопределённость в разрешение торговать.';}
  else if(!trading){state='hold';message='В этой учебной ветви сохранение позиции прошло полный контроль. Новая заявка не нужна. HOLD не отменяет обязательных защитных правил.';}
  else if(!recorded){state='admitted';message='Торговый кандидат условно допущен. До записи намерения новая заявка в этой ветви ещё не возникает.';}
  else if(execution.value==='at_t'){state='intent';message='Намерение записано в t. Исполнение по цене того же закрытия исключено. Оно рассматривается в первой подходящей более поздней сессии, начиная с t+1.';}
  else if(execution.value==='later_fill'){state='filled_later';message='Показана условная ветвь исполнения в подходящей сессии t+1 или позднее. Только исполненная операция меняет количество активов; цены и объёмы здесь не рассчитываются.';}
  else if(execution.value==='pending'){state='pending';message='Исполнение отложено. По этому намерению нет нового исполненного объёма. Деньги, обеспечение и ожидающие операции остаются в единой книге.';}
  else{state='blocked';message='Исполнение блокируется операционными условиями. Допущенный ранее кандидат не гарантирует сделку; текущие обязательства продолжают учитываться.';}
  root.dataset.episodeState=state;root.dataset.candidate=available?candidate:'none';
  q('#episodeOutcome').textContent=message;
  q('#episodeBookNote').textContent=state==='filled_later'?'После условного исполнения обновляются позиции и связанные денежные потоки.':'Без исполнения количество по этому намерению не меняется. Переоценка и обязательства продолжаются.';
  const branch=!available||!admitted?'no-trade':!trading?'hold':'intent';qa('[data-outcome]').forEach(el=>el.classList.toggle('is-active',el.dataset.outcome===branch));
  qa('[data-stage]').forEach(el=>el.classList.toggle('is-current',Number(el.dataset.stage)===step));q('#episodeStepLabel').textContent=(step+1)+' / 6 · '+stages[step];root.dataset.step=String(step);
 }
 qa('[data-candidate]').forEach(b=>b.addEventListener('click',()=>{candidate=b.dataset.candidate;gate.value='proposed';intent.value='draft';execution.value='at_t';render();}));
 for(const control of [known,gate,intent,execution])control.addEventListener('change',render);
 q('#episodeNext').addEventListener('click',()=>{step=(step+1)%6;render();});
 q('#episodeBoard').addEventListener('keydown',ev=>{if((ev.code==='Space'||ev.key===' ')&&!ev.target.closest('button,select,input,textarea,a')){ev.preventDefault();step=(step+1)%6;render();}});
 window.smltEpisode={capture:()=>({state:root.dataset.episodeState,candidate:availableCandidate(),step,ledgerContinues:true,executedIllustration:root.dataset.episodeState==='filled_later'}),reset:()=>{known.value='known';gate.value='proposed';intent.value='draft';execution.value='at_t';candidate='ROTATE';step=0;render();}};
 function availableCandidate(){return root.dataset.candidate;}
 render();
})();
