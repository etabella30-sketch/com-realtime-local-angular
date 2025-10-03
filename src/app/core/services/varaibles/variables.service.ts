import { Injectable } from '@angular/core';

@Injectable(
  {
    providedIn: 'root'
  }
)
export class VariablesService {
  comnicn: object = {
    'eye': '\ue017',
    'eyeoff': '\ue018',
    'chvy': '\ue00D',
    'setting': '\ue015',
    'lock': '\ue005',
    'alert': '\ue016',
    'search': '\ue002',
    'add': '\ue013',
    'user': '\ue000',
    'userfill': '\ue001',
    'bundle': '\ue013',
    'folder': '\ue012',
    'file': '\ue011',
    'addfill': '\ue011',
    'removefill': '\ue003',
    'addcircle': '\ue012',
    'info': '\ue006',
    'menu': '\ue004',
    'chvx': '\ue007',
    'delete': '\ue00B',
    'check': '\ue00e',
    'edit': '\ue00A',
    'close': '\ue00C',
    'remove-outline': '\ue014',
    'folderopen': '\ue01c',
    'email': '\ue016',
    'removecircle': '\ue014',
    'notification': '\ue010',
  };

  adminicn: object = {
    "realtime": "\ue000",
    "present": "\ue00A",
    "archive": "\ue002",
    "hyperlink": "\ue003",
    "tableview": "\ue004",
    "drag": "\ue005",
    "listview": "\ue006",
    "upload": "\ue007",
    "preview": "\ue008",
    "addfolder": "\ue00b",

  }

  indicn: object = {
    "Qfact": "\ue006",
    "fact": "\ue007",
    "doclink": "\ue005",
    "weblink": "\ue001",
    "textF": "\ue000",
    "factIn": "\ue002",
    "factOut": "\ue008",
    "docIn": "\ue003",
    "docOut": "\ue004",
    "note": "\ue009",
    "pageF": "\ue00a",
    "clock": "\ue00b",
    "thumbnailview": "\ue00c",
    "factD": "\ue00d",
    "first": "\ue00e",
    "file": "\ue00f",
  }

  extra: object = {
    "copy": "\ue000",
    "cut": "\ue001",
    "sort": "\ue003",
    "backspace": "\ue004",
    "caret": "\ue002",
    "retry": "\ue009",
    "pause": "\ue005",
    "resume": "\ue006",
    "report": "\ue007",
    "replace": "\ue008",
    "compare": "\ue00a",
    "hand": "\ue00b",
    "download": "\ue00e",


    "Qfact": "\ue00d",
    "Qmark": "\ue00c",
    "message": "\ue014",
    "myfiles": "\ue015",
    "workspace": "\ue012",
    "tasks": "\ue013",
    "properties": "\ue010",
    "info-outline": "\ue016",
    "closebold": "\ue018",
    "bookmark": "\ue017",
    "allsection": "\ue019",
    "temp": "\ue01a",
    "fullview": "\ue01b",
    "undo": "\ue01c",




  }

  real_icn: object = {
    "export": "\ue005",
    "play": "\ue006",
    "pause": "\ue007",
    "stop": "\ue004",
    "highlighter": "\ue003",
    "setting": "\ue002",
    "fileinfo": "\ue006",
    "link": "\ue001",
     "timestamp": "\ue009",
     "sync": "\ue008"
  }

  myfileicn: object = {
    "issue": "\ue002",
    "tag": "\ue001",
    "contacts": "\ue003",
    "custombundle": "\ue000",
    "transcript": "\ue004",
    "userfiles": "\ue005",
    "metadata": "\ue006",
  }
  toolicn: object = {
    "rotate": "\ue000",
    "lock": "\ue002",
    "unlock": "\ue001",
    "nextfile": "\ue003",
    "pencil": "\ue005",
    "shape": "\ue006",
    "doctool": "\ue007",
    "webtool": "\ue004",
  }
  getIconUnicode(name: string, type: string): string {
    return this[type][name] || '';
  }


  btnvarnt: any =
    {
      'solid': 'text-white bg-brand border border-brand  hover:border-brand hover:shadow-[0px_4px_4px_#00000050] rounded-base active:text-brand active:bg-brand/20 active:shadow-none disabled:opacity-30 disabled:pointer-events-none',
      'white': ' text-grey text-xs bg-white border border-white  hover:border-blue-on/0 hover:bg-blue-on/20 hover:text-blue-on hover:shadow-none  shadow-[0px_4px_10px_rgba(75,77,82,0.24)] rounded-base  active:bg-blue-on/20 active:border-blue-on active:shadow-[inset_0px_0px_3px_#005affc7] disabled:opacity-30 disabled:pointer-events-none',
      'outlined': ' text-grey text-xs bg-white border border-tab  hover:border-blue-on/0 hover:bg-blue-on/20 hover:text-blue-on hover:shadow-none   rounded-base  active:bg-blue-on/20 active:border-blue-on active:shadow-[inset_0px_0px_3px_#005affc7] disabled:opacity-30 disabled:pointer-events-none',
      'dark': ' text-blue-hover text-xs bg-transparent border border-blue-hover   hover:bg-blue-on/20    rounded-base  active:bg-blue-on/20 active:border-blue-on active:shadow-[inset_0px_0px_3px_#005affc7] disabled:opacity-30 disabled:pointer-events-none',
      'darkwhite': ' text-white text-xs bg-transparent border border-whitw   hover:bg-blue-on/20    rounded-base  active:bg-blue-on/20 active:border-blue-on active:shadow-[inset_0px_0px_3px_#005affc7] disabled:opacity-30 disabled:pointer-events-none',
      'gradient': ' text-white text-xs bg-gradient-to-b from-blue-700 to-blue-400 border border-white   hover:bg-blue-on/20 hover:text-white  hover:shadow-[0px_4px_4px_#00000050] rounded-base   disabled:opacity-30 disabled:pointer-events-none',
      'text': 'text-grey text-xs underline hover:text-blue-on hover:no-underline',
      'active': 'hover:bg-white !text-blue-on !bg-blue-deactivate !border-blue-on hover:shadow-[inset_0px_0px_6px_1px_#9FCCFF] shadow-[inset_0px_0px_10px_1px_#268cff]',
    };
  badgevarnt: any =
    {
      'solid': 'bg-faint text-gray-600',
      'dark': 'bg-grey text-white',
      'outlined': ' border border-gray-800 text-gray-800 dark:border-gray-200 dark:text-white',

      'light': 'bg-reply text-grey',
      'white': 'bg-white text-grey',
      'darklight': 'bg-text-light-grey text-white',
    };

  inputvarnts: any = {
    'baseClasses': 'block w-full px-3 py-2 border  rounded-base shadow-sm focus:outline-none text-xs',
    'disabledClasses': 'bg-gray-100 border-gray-300 text-gray-500 ',
    'errorClasses': 'border-red-500 text-red-600 focus:ring-red-500',
    'normalClasses': 'border-tab text-gray focus:shadow-[0px_0px_6px_#0066FF] focus:border-blue-deactivate',
    'inlineClasses': 'px-3.5 py-2 rounded-base placeholder-shown:bg-white bg-faint !rounded-none !px-1 !py-1 !bg-blue-deactivate border-none block w-full px-3 border shadow-sm focus:outline-none text-xs border-tab text-gray focus:border-blue-on focus:border-blue-deactivate'
  }

  constructor() { };

}
