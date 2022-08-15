import axios from 'axios';
import React from 'react';
let speech = new SpeechSynthesisUtterance();
let interval;
let lastWord = {
    status: false,
    word: ''
};
let playVoice = false;
function Foreground() {
    (()=>{
        const style = document.createElement('style');
        style.innerHTML = `
        body{margin:0px;}.output_canvas.active{display:'block'}.hand_sign{
            position: fixed;
            bottom: 0;
            left: 0;
            width:640px;
            height: 360px;
            display:'none';
            z-index: 99999999999;
            border: none;
            margin: 0;
            background:#000;
            border: 5px solid #000;
        }.handTran{position: fixed; top:5px;left:5px;background:green;padding:5px 10px;z-index: 99999999999;}
        svg,.voice img{
            pointer-events: none;
        }
        .hoster > *, .showText > *{
            pointer-events: none;
        }
        .hoster.active, .showText.active, .voice.active{
            opacity:.3;
        }
        .get_text{
            position: absolute;
            left:50%;
            top:-100%;
            transform: translateX(-50%);
            background:#000;
            color:#fff;
            padding:10px;
            font-size:20px;
            overflow: auto;
        }
        `;
        document.getElementsByTagName('head')[0].appendChild(style);
    })()
    const hoster = `<div title="Host The Hand Sign" class="NHaLPe CoOyx"><span data-is-tooltip-wrapper="true"><button id="hoster" class="hoster VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ tWDL4c jh0Tpd Gt6sbf QQrMi NKaD6" style="background: #fff;--mdc-ripple-fg-size:32px; --mdc-ripple-fg-scale:1.75; --mdc-ripple-left:12px; --mdc-ripple-top:4px;"><div class="VfPpkd-Bz112c-Jh9lGc"></div><div class="VfPpkd-Bz112c-J1Ukfc-LhBDec"></div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA+ElEQVRIieXVsUoDQRAG4E/RUtHGUglYWJl0grUIdikt8gB5DlvBN7AV8UHSmyKPIAoiiNjYXIq7kMtyd7l1gyL+sMwyu/P/O7PLLH8da6V51rDWBpXx67EnisVGhS/25GHcQiaxGWQhwSpwg6tAoIsvDJcFt8ngDJeBbwub+MQ+dlMEHnGInUAAXnGPSYrAWH6BvZJvu7BvOCr2fBvn8rq/m9/Bc2H7hb1OEdgrEdeNQSzpBR7M675M4LiOqKlVpOJnWsWvoyd/ik31v00VOcVHDfkTDtoSNTWyE4zk/SfDC+7QieFZVadc4Kn6D2aLqT8a/sMzTcYUVFFLBDTQ5qYAAAAASUVORK5CYII="/></button><div class="EY8ABd-OWXEXe-TAWMXe" role="tooltip" aria-hidden="true" id="tt-c7">Leave call</div></span></div>
    <div title="Show Text" class="NHaLPe CoOyx"><span data-is-tooltip-wrapper="true"><button id="showText" class="showText VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ tWDL4c jh0Tpd Gt6sbf QQrMi NKaD6" style="background: #fff;--mdc-ripple-fg-size:32px; --mdc-ripple-fg-scale:1.75; --mdc-ripple-left:12px; --mdc-ripple-top:4px;"><div class="VfPpkd-Bz112c-Jh9lGc"></div><div class="VfPpkd-Bz112c-J1Ukfc-LhBDec"></div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAADtUlEQVRIibVUb0wbZRx+3uu115b+obRdaaFQoFZgGokQiIuB/SPMLIvGSaLGZWpmIsQPJk7jx/lFzaLRsBg3Zsxm4hdwJo5s2aJzhLglkjExbDhpZzvWhtJ2Wf9wba/t3fnhaOloOxNkz6f3nve53/M+v3t/BzxikMGR6T6jVvU5TRF+MwvnBFF2L5F6j1YQec/Lzzo6G81Vm1kfd8IsTl7w9FCbWrUMyhrEk1nEk9n/zQMAvZ74fSGC05P/AABe396MbpdpQ3zFBFduhSEIIgRBxG+3whvmKxq4bNrCurVOt2E+j5IW7e2qR7NFeqndrt8wX9GAlBFyOQHB+ymkszkA0hW0GlRQ0FRZ/UMNinEnzGLGEwEFEW02DVqMDAAgGE3hnCcMEQSdThMeNkN0VhB8Z676/GpGnsmTOUGQpTne/HSTjhnaaZcxchm8UREhVtp32rXof9IMLsvj+6sB/ocrXo5R0GGaogp/gySXVeTAe8l6x8GR6b4GY9U37+9tcVr0DO6ngYu3BcTSD+qqlcBAC4VqJRCMceJn52577obZQ2Pvdk8V62TFD68cu/aCq1bz7UcvPd6oV8uR4YGf/haQ4Eqjp3PAYkxEq4lAr6LJznaTcSHI7rH1vuGfOz96s8Tg0MnZ155xGr48vM9poykp2FxIhDe62jaeh3sxiCTLoqNBDTZLkMoBDA3UaggoiqC3zahdjnLbLL0Hl2YnTtwAVufg1WMzA602zdG3dzusxT0LJNbWcwuLmPf4kVqJwWWSQcdIykB8TUMADPc7bFutui8OfD0zUDBQyKn929tMhvVtyAliYZ1MSX2avxvD0Qk37iWlvWyRJo++dqOOJtSLBQO2xj10/JJv0h1kM8VCg3ItT2tzHVRKBmoVA7vVUuBrVA/ek4UlNjP6q29ypcY9nE8FABgcG5Ppoo+deWtHY3+P06AGgEgS+PEvAaVnXG0JAfa3UTCqpOcZbzR1/JLvsicQfX7yyI4cUPSR58fHReeBXeN/3qS20hRld1k1SrUckMsAf7y8wTY7gaNaOuPZ68ux76b8ZxuWOgZPHWkqzEPJHADAwRPXhxoMqg/eGWhybNExCMRF/LEMhFZEgACWKoKOWqBOSxCKcxi56PX5I8lPTg93jpakrJAez308ZbaZtV+5ajXde57aUv9EvVZGEUkuiCJu+BP8+dmQ37O8Mh2K8cMTh7siZdtYySCP3Z9e01u15E2tWr6LkVPVAMBlhWg8mfk5mMCpXz7siv1XjUeKfwEeuYgBsWfbyAAAAABJRU5ErkJggg=="/></button><div class="EY8ABd-OWXEXe-TAWMXe" role="tooltip" aria-hidden="true" id="tt-c7">Leave call</div></span></div>
    <div title="Voice" class="NHaLPe CoOyx"><span data-is-tooltip-wrapper="true"><button id="voice" class="voice VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ tWDL4c jh0Tpd Gt6sbf QQrMi NKaD6" style="background: #fff;--mdc-ripple-fg-size:32px; --mdc-ripple-fg-scale:1.75; --mdc-ripple-left:12px; --mdc-ripple-top:4px;"><div class="VfPpkd-Bz112c-Jh9lGc"></div><div class="VfPpkd-Bz112c-J1Ukfc-LhBDec"></div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAEVUlEQVRogdWaW4gVRxCGv6PrFV3RGBTDCiquShTiBUVQNxoNoi5CEkHxYcmLRggYFMxbgviq4oOiqGD0IYIXIorBu7uoIQhGRXf1yCaSRFcN5OYlXqI7PlQ106d3jrtnpndbf2hqznR3Tf0zVdU1PScH/AYMAO5ruwvcBH4GLgI/6rnXHr8CUSutAVgDjAxkY6vIqewGlGsbBAwFKoGJwCSgt46LgO+Br4CfOtRSDygDZgLbgEcImefAOqBLQLsyoT+wHvgfIXQa6BXUooyYBNxCyBwBOoU1JxuGAXcQMssD25IZcxEifwA9AtuSGRcQMtUhjfDh27Uqx3vQlRo+iDxQGXnQlRo+iMxQWe9BVzCMJg72N3ZxBOiOFJovgIEhDcnqWk+AY6pnfnZzwmIx4l7HQhuSFX2Ap0j91T+UET6y1r/IWlIGzPOgLxV8FXuHVU7wpK9k+CIy2JOeoHgPSb/PgcmBbcmEL5GstSOkET5c6xeVHwJvZdCTA84BZ4j3EjoUZcBZ5Kl8l0FPBfGuTbDdmgrgTzViWUodc4iJfObJrlT4CGhGypZxKeavIiay26NdqbBBDWlEVvxSsIuYyB0CxYlBV+C8GrOnxLkXdV4zxeMkB5zU1u5EhwMP1ZjpbZxTBjzWOUcpHifvUiQhtMd+VCNxyWITySEbeqdoeTeHI+82TcB+PVeVoHumdfx+ZkuLYCywEcgTu4j9jjKd4ul1AfHTqKR4nByiAxLCGesijcAip/8bq3+p07daz6/V37dpSbgL8jaamBB8upbZnd8KjKDwjvUCPrZ+u24xWuVVlXUJ48xXgWvI95qBeh3AL5HjKocgRaSNTxAyppxx/X+MSkOkNmGciY/jVr+3OHkHqbFWAnuRR34hYVyt9n1K7DbmbvZEiL/QY7TPdR9TBlUjGc1LnAy1DLJbMy3T5hA9/xB5Kt9SGCcT9PcNZ14TcZyUA8+0leu5AqJpXasH8LYe30c+Ai1HMtcWZ2yNXmyfknHdxsTHFWee7T5VSLCf1+vlceIkLZF64AvkrpTruT3AZWuMyWJf6++djoEuERMfBnXWOBMfJ1RGeI6TGmTvN0Lutr1g2en4NIVrgnGbSuKVfIGj246TBj2eYvV7ixODUcBflPY+YuJkCXGsjUoYZwhHiEvZ27It4iQrDlsX+7yNc5ZSWFc9RuotF7st3YecvhzxF7ORPtYRkzJXIiVKW2D8e5bK68jmRbFxEMeHQUGc+CBySWXPV44qRJ5Cl3AzlkGddewSsfurfBBpUtmvxHm2kW7GMsgj1fJJJOBdmCcyLckvDcYDs5EAa7LaPeBvoDOyMNbo+OttMN41YqEeFyMSAR+8Qkce+AFZcBOxidb/n2K3q5T+VddknQjZvMiEpLRVDRwE/gM2I5vUFci26GBkNe2L1Ea/AweQMvyfFNeuRZ7sVNrhG6RJpyt8K25v2Cuwac8oPXiDIilrRcB2ZLV+Y/ASg/1Av8XN6vUAAAAASUVORK5CYII="/></button><div class="EY8ABd-OWXEXe-TAWMXe" role="tooltip" aria-hidden="true" id="tt-c7">Leave call</div></span></div>`;
    let testWindow = false;
    window.onunload = async function(){
        let token = window.localStorage.getItem('sign_token');
        if(token){
            await axios.delete(`https://tranquil-tor-13610.herokuapp.com/hoster/${location.pathname}/${token}`); 
        }
    }
    setInterval(() => {
        if(testWindow) return;
        if(document.querySelector("div.UnvNgf.Sdwpn.P9KVBf > div.Tmb7Fd > div")){
            testWindow = true;
            document.querySelector("div.UnvNgf.Sdwpn.P9KVBf > div.Tmb7Fd > div").insertAdjacentHTML('beforeend', hoster);
            document.getElementById('hoster').addEventListener('click',async (e)=>{
                e.preventDefault();
                if(e.target.classList.contains('active')){
                    let token = window.localStorage.getItem('sign_token');
                    const testHoster = await axios.delete(`https://tranquil-tor-13610.herokuapp.com/hoster/${location.pathname}/${token}`);
                    if(testHoster.data.status == 'ok'){
                        window.localStorage.removeItem('sign_token');
                        e.target.classList.remove('active');
                        document.querySelector('.hand_sign').remove();
                        return
                    }
                    alert('only who create the host anable to delete it!');
                    return
                }
                let token = window.localStorage.getItem('sign_token');
                if(!token){
                    token = (Math.random() + 1).toString(36).substring(7);
                }
                const testHoster = await axios.post(`https://tranquil-tor-13610.herokuapp.com/hoster/${location.pathname}/${token}`);

                if(testHoster.data.status == 'again'){
                    e.target.classList.add('active');
                    document.documentElement.insertAdjacentHTML('afterbegin', `<iframe class='hand_sign active' src="https://tranquil-tor-13610.herokuapp.com/video?h=${360}&w=${640}&token=${token}" scrolling="no" style="overflow: hidden;" allow="camera;microphone"></iframe>`);
                    return
                }
                if(testHoster.data.status == 'ok'){
                    window.localStorage.setItem('sign_token', token);
                    e.target.classList.add('active');
                    document.documentElement.insertAdjacentHTML('afterbegin', `<iframe class='hand_sign active' src="https://tranquil-tor-13610.herokuapp.com/video?h=${360}&w=${640}&token=${token}" scrolling="no" style="overflow: hidden;" allow="camera;microphone"></iframe>`);
                    return
                }
                //already hosted
                alert('only one host allowed!');
            });
            document.getElementById('showText').addEventListener('click', (e)=>{
                e.preventDefault();
                if(!e.target.classList.contains('active')){
                    e.target.classList.add('active');
                    document.querySelector('.UnvNgf.Sdwpn.P9KVBf').insertAdjacentHTML('beforeend', `<h2 id="get_text" class='get_text'></h2>`);
                    interval = setInterval(getSentence, 3000);
                    return;
                }
                e.target.classList.remove('active');
                document.querySelector('.get_text').remove();
                clearInterval(interval);
            });
            document.getElementById('voice').addEventListener('click', (e)=>{
                e.preventDefault();
                if(!e.target.classList.contains('active')){
                    e.target.classList.add('active');
                    playVoice = true;
                    console.log('play voice');
                    return;
                }
                console.log('stop voice');
                e.target.classList.remove('active');
                playVoice = false;
            });
            async function getSentence() {
                const req = await axios.get(`https://tranquil-tor-13610.herokuapp.com/hoster/${location.pathname}/get`);
                let text = req.data.sentence;
                if(typeof text == 'object') {
                    if(text.length == 0) return;
                    let currentLastWord = text[text.length-1];
                    document.querySelector('.get_text').textContent = text.join(' ');
                    speech.text = currentLastWord;
                    if(lastWord.word == currentLastWord || !playVoice) return;
                    lastWord.word = currentLastWord;
                    window.speechSynthesis.speak(speech);
                }
            }
        }
    }, 10);
    return (<></>);
}
export default Foreground;