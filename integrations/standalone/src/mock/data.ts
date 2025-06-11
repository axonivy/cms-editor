import type { CmsData } from '@axonivy/cms-editor-protocol';

export const contentObjects: CmsData = {
  context: { app: '', pmv: '', file: '' },
  data: [
    { uri: '/Dialogs', type: 'FOLDER', values: {} },
    { uri: '/Dialogs/agileBPM', type: 'FOLDER', values: {} },
    { uri: '/Dialogs/agileBPM/define_WF', type: 'FOLDER', values: {} },
    {
      uri: '/Dialogs/agileBPM/define_WF/AddTask',
      type: 'STRING',
      values: { de: 'Aufgabe zum Ablauf hinzufügen', en: 'Add a task to the sequence' }
    },
    { uri: '/Dialogs/agileBPM/define_WF/AdhocWorkflowTasks', type: 'STRING', values: { de: 'Workflow Aufgaben', en: 'Workflow Tasks' } },
    { uri: '/Dialogs/agileBPM/define_WF/Case', type: 'STRING', values: { de: 'Fall', en: 'Case' } },
    {
      uri: '/Dialogs/agileBPM/define_WF/CommaSeparatedListOfUsers',
      type: 'STRING',
      values: { de: 'Komma getrennte Liste von Benutzern:', en: 'Comma separated list of users:' }
    },
    { uri: '/Dialogs/agileBPM/define_WF/Creator', type: 'STRING', values: { de: 'ERSTELLER', en: 'CREATOR' } },
    { uri: '/Dialogs/agileBPM/define_WF/DeleteStep', type: 'STRING', values: { de: 'Diesen Schritt löschen', en: 'Delete this Step' } },
    { uri: '/Dialogs/agileBPM/define_WF/Details', type: 'STRING', values: { de: 'Details', en: 'Details' } },
    { uri: '/Dialogs/agileBPM/define_WF/ForwardTo', type: 'STRING', values: { de: 'Weiterleiten an:', en: 'Forward to: ' } },
    { uri: '/Dialogs/agileBPM/define_WF/Ok', type: 'STRING', values: { de: 'OK', en: 'OK' } },
    { uri: '/Dialogs/agileBPM/define_WF/PatternAdHoc', type: 'STRING', values: { de: 'Ad-Hoc', en: 'Ad-hoc' } },
    { uri: '/Dialogs/agileBPM/define_WF/PatternApproval', type: 'STRING', values: { de: 'Freigabe', en: 'Approval' } },
    { uri: '/Dialogs/agileBPM/define_WF/PatternQA', type: 'STRING', values: { de: 'Frage-Antwort', en: 'Question-Answer' } },
    { uri: '/Dialogs/agileBPM/define_WF/PatternTodo', type: 'STRING', values: { de: 'ToDo', en: 'ToDo' } },
    {
      uri: '/Dialogs/agileBPM/define_WF/ResponsableUsers',
      type: 'STRING',
      values: { de: 'Verantwortlicher Benutzer', en: 'Responsable Users' }
    },
    { uri: '/Dialogs/agileBPM/define_WF/SequenceOfTasks', type: 'STRING', values: { de: 'Nachfolgende Aufgaben', en: 'Following Tasks' } },
    {
      uri: '/Dialogs/agileBPM/define_WF/ShowDetails',
      type: 'STRING',
      values: { de: 'Zeige Details zu den Vorlagen', en: 'Show details to the patterns' }
    },
    { uri: '/Dialogs/agileBPM/define_WF/StartWF', type: 'STRING', values: { de: 'Workflow starten', en: 'Start Workflow' } },
    { uri: '/Dialogs/agileBPM/define_WF/TaskActor', type: 'STRING', values: { de: 'Ausführender Benutzer', en: 'TaskActor' } },
    {
      uri: '/Dialogs/agileBPM/define_WF/TaskDescription',
      type: 'STRING',
      values: { de: 'Beschreibung der Aufgabe', en: 'Task Description' }
    },
    { uri: '/Dialogs/agileBPM/define_WF/TaskSubject', type: 'STRING', values: { de: 'Name der Aufgabe', en: 'Task Name' } },
    { uri: '/Dialogs/agileBPM/define_WF/WFAttachment', type: 'STRING', values: { de: 'Anhang', en: 'Attachment' } },
    { uri: '/Dialogs/agileBPM/define_WF/WFCategory', type: 'STRING', values: { de: 'Kategorie', en: 'Category' } },
    { uri: '/Dialogs/agileBPM/define_WF/WFDescription', type: 'STRING', values: { de: 'Beschreibung', en: 'Description' } },
    { uri: '/Dialogs/agileBPM/define_WF/WFPattern', type: 'STRING', values: { de: 'Vorlage', en: 'Pattern' } },
    { uri: '/Dialogs/agileBPM/define_WF/WFSubject', type: 'STRING', values: { de: 'Betreff', en: 'Subject' } },
    { uri: '/Dialogs/agileBPM/define_WF/WFUser', type: 'STRING', values: { de: 'WF Benutzer', en: 'WF User' } },
    { uri: '/Dialogs/agileBPM/define_WF/Workflow', type: 'STRING', values: { de: 'Workflow', en: 'Workflow' } },
    { uri: '/Dialogs/agileBPM/define_WF/YourComment', type: 'STRING', values: { de: 'Ihr Kommentar', en: 'Your comment' } },
    { uri: '/Dialogs/agileBPM/task_Form', type: 'FOLDER', values: {} },
    { uri: '/Dialogs/agileBPM/task_Form/AddAdHocTask', type: 'STRING', values: { de: 'Ad-Hoc Aufgabe hinzufügen', en: 'Add ad-hoc task' } },
    { uri: '/Dialogs/agileBPM/task_Form/Append', type: 'STRING', values: { de: 'Anfügen', en: 'Append' } },
    {
      uri: '/Dialogs/agileBPM/task_Form/AppendATaskAfter',
      type: 'STRING',
      values: { de: 'Eine Aufgabe im Ablauf nach meiner Aufgabe einfügen.', en: 'Add a task into the sequence following my task.' }
    },
    { uri: '/Dialogs/agileBPM/task_Form/AssignTo', type: 'STRING', values: { de: 'Zuweisen an', en: 'Assign to' } },
    { uri: '/Dialogs/agileBPM/task_Form/Attachment', type: 'STRING', values: { de: 'Anhang', en: 'Attachment' } },
    { uri: '/Dialogs/agileBPM/task_Form/Case', type: 'STRING', values: { de: 'Fall', en: 'Case' } },
    { uri: '/Dialogs/agileBPM/task_Form/ConfirmTodo', type: 'STRING', values: { de: 'Todo erledigt', en: 'Confirm the Todo' } },
    { uri: '/Dialogs/agileBPM/task_Form/Deadline', type: 'STRING', values: { de: 'Frist', en: 'Deadline' } },
    { uri: '/Dialogs/agileBPM/task_Form/Decision', type: 'STRING', values: { de: 'Entscheidung', en: 'Decision' } },
    { uri: '/Dialogs/agileBPM/task_Form/Decline', type: 'STRING', values: { de: 'Ablehnen', en: 'Decline' } },
    { uri: '/Dialogs/agileBPM/task_Form/DeclineTodo', type: 'STRING', values: { de: 'Aufgabe ablehnen', en: 'Decline the task' } },
    { uri: '/Dialogs/agileBPM/task_Form/DeleteTask', type: 'STRING', values: { de: 'Aufgabe löschen' } },
    { uri: '/Dialogs/agileBPM/task_Form/Description', type: 'STRING', values: { de: 'Beschreibung', en: 'Description' } },
    { uri: '/Dialogs/agileBPM/task_Form/Done', type: 'STRING', values: { de: 'Erledigt', en: 'Done' } },
    { uri: '/Dialogs/agileBPM/task_Form/Finish', type: 'STRING', values: { de: 'Beenden', en: 'Finish' } },
    { uri: '/Dialogs/agileBPM/task_Form/FollowUpQuestion', type: 'STRING', values: { de: 'Anschlussfrage', en: 'Follow-up question' } },
    {
      uri: '/Dialogs/agileBPM/task_Form/InsertATaskBefore',
      type: 'STRING',
      values: {
        de: 'Aufgabe vor meiner Aufgabe einfügen. Meine Aufgabe wird zurückgestellt.',
        en: 'Insert a task before my task. My task will be postboned.'
      }
    },
    { uri: '/Dialogs/agileBPM/task_Form/MyAnswer', type: 'STRING', values: { de: 'Meine Antwort', en: 'My answer' } },
    {
      uri: '/Dialogs/agileBPM/task_Form/MyTaskIsDoneAnd',
      type: 'STRING',
      values: { de: 'Meine Aufgabe ist erledigt und eine neue Aufgabe wurde angefügt', en: 'My task is done and the new task is appended' }
    },
    { uri: '/Dialogs/agileBPM/task_Form/NoNOK', type: 'STRING', values: { de: 'Nein, nicht ok', en: 'No, not ok' } },
    { uri: '/Dialogs/agileBPM/task_Form/Remarks', type: 'STRING', values: { de: 'Anmerkungen', en: 'Remarks' } },
    { uri: '/Dialogs/agileBPM/task_Form/Send', type: 'STRING', values: { de: 'Senden', en: 'Send' } },
    { uri: '/Dialogs/agileBPM/task_Form/Task', type: 'STRING', values: { de: 'Aufgabe', en: 'Task' } },
    { uri: '/Dialogs/agileBPM/task_Form/Workflow', type: 'STRING', values: { de: 'Workflow', en: 'Workflow' } },
    { uri: '/Dialogs/agileBPM/task_Form/YesOK', type: 'STRING', values: { de: 'Ja, ok', en: 'Yes, its ok' } },
    { uri: '/Dialogs/agileBPM/task_Form/YourComment', type: 'STRING', values: { de: 'Ihr Kommentar', en: 'Your comment' } },
    { uri: '/Dialogs/agileBPM/task_Form/YourDecision', type: 'STRING', values: { de: 'Ihre Entscheidung', en: 'Your decision' } },
    { uri: '/Dialogs/general', type: 'FOLDER', values: {} },
    { uri: '/Dialogs/general/locale', type: 'STRING', values: { en: 'de_CH' } },
    { uri: '/Dialogs/general/name', type: 'STRING', values: { de: 'Name', en: 'Name' } },
    { uri: '/Dialogs/general/proceed', type: 'STRING', values: { de: 'Durchführen', en: 'Proceed' } },
    { uri: '/Dialogs/procurementRequest', type: 'FOLDER', values: {} },
    { uri: '/Dialogs/procurementRequest/accept', type: 'STRING', values: { de: 'Akzeptieren', en: 'Accept' } },
    {
      uri: '/Dialogs/procurementRequest/acceptDescription',
      type: 'STRING',
      values: {
        de: 'Der nachfolgende Beschaffungsantrag muss beantwortet werden:',
        en: 'The following procurement request needs to be answered:'
      }
    },
    { uri: '/Dialogs/procurementRequest/acceptedBy', type: 'STRING', values: { de: 'Angenommen von', en: 'Accepted by' } },
    {
      uri: '/Dialogs/procurementRequest/AcceptTitle',
      type: 'STRING',
      values: { de: 'Beschaffungstrag annehmen', en: 'Accept Procurement Request' }
    },
    { uri: '/Dialogs/procurementRequest/amount', type: 'STRING', values: { de: 'Menge', en: 'Amount' } },
    { uri: '/Dialogs/procurementRequest/currencySymbol', type: 'STRING', values: { de: '$', en: '$' } },
    { uri: '/Dialogs/procurementRequest/decline', type: 'STRING', values: { de: 'Ablehnen', en: 'Decline' } },
    { uri: '/Dialogs/procurementRequest/declinedBy', type: 'STRING', values: { de: 'Abgelehnt von', en: 'Declined by' } },
    { uri: '/Dialogs/procurementRequest/description', type: 'STRING', values: { de: 'Beschreibung', en: 'Description' } },
    {
      uri: '/Dialogs/procurementRequest/enterDescription',
      type: 'STRING',
      values: { de: 'Bitte geben Sie die Antragsdaten ein.', en: 'Please enter your request data.' }
    },
    {
      uri: '/Dialogs/procurementRequest/enterTitle',
      type: 'STRING',
      values: { de: 'Beschaffungsantrag erfassen', en: 'Enter Procurement Request' }
    },
    { uri: '/Dialogs/procurementRequest/forTotal', type: 'STRING', values: { de: 'zum Gesamtpreis von', en: 'for a total of' } },
    { uri: '/Dialogs/procurementRequest/notes', type: 'STRING', values: { de: 'Notizen', en: 'Notes' } },
    { uri: '/Dialogs/procurementRequest/piecesOf', type: 'STRING', values: { de: 'Stück', en: 'pieces of' } },
    { uri: '/Dialogs/procurementRequest/pricePerUnit', type: 'STRING', values: { de: 'Stückpreis', en: 'Price per Unit' } },
    { uri: '/Dialogs/procurementRequest/requestedBy', type: 'STRING', values: { de: 'Beantragt von', en: 'Requested by' } },
    { uri: '/Dialogs/procurementRequest/totalPrice', type: 'STRING', values: { de: 'Total', en: 'Total' } },
    { uri: '/Dialogs/procurementRequest/verified', type: 'STRING', values: { de: 'Prüfen', en: 'Verify' } },
    { uri: '/Dialogs/procurementRequest/verifiedBy', type: 'STRING', values: { de: 'Geprüft von', en: 'Verified by' } },
    { uri: '/Dialogs/procurementRequest/verify', type: 'STRING', values: { de: 'Prüfen', en: 'Verify' } },
    {
      uri: '/Dialogs/procurementRequest/verifyDescription',
      type: 'STRING',
      values: {
        de: 'Der nachfolgende Beschaffungsantrag muss geprüft werden:',
        en: 'The following procurement request needs to be verified:'
      }
    },
    {
      uri: '/Dialogs/procurementRequest/verifyTitle',
      type: 'STRING',
      values: { de: 'Beschaffungsantrag prüfen', en: 'Verify Procurement Request' }
    },
    { uri: '/Dialogs/signal', type: 'FOLDER', values: {} },
    { uri: '/Dialogs/signal/city', type: 'STRING', values: { de: 'Stadt', en: 'City' } },
    { uri: '/Dialogs/signal/createProcesses', type: 'STRING', values: { de: 'Prozesse erstellen', en: 'Create Processes' } },
    {
      uri: '/Dialogs/signal/CreateUserDescription',
      type: 'STRING',
      values: { de: 'Bitte geben Sie die Daten des neuen Mitarbeiters ein.', en: 'Please insert the new employees data' }
    },
    { uri: '/Dialogs/signal/CreateUserTitle', type: 'STRING', values: { de: 'Neuer Mitarbeiter', en: 'New Employee' } },
    { uri: '/Dialogs/signal/Finish', type: 'STRING', values: { de: 'Beenden', en: 'Finish' } },
    { uri: '/Dialogs/signal/name', type: 'STRING', values: { de: 'Name', en: 'Name' } },
    {
      uri: '/Dialogs/signal/QuitSignalSent',
      type: 'STRING',
      values: { de: 'Mitarbeiter erfolgreich ausgetreten.', en: 'Employee successfully quit.' }
    },
    {
      uri: '/Dialogs/signal/QuitUserDescription',
      type: 'STRING',
      values: {
        de: 'Bitte geben Sie die Benutzerkennung des austretenden Mitarbeiters an.',
        en: 'Please insert the User Key of the leaving employee.'
      }
    },
    { uri: '/Dialogs/signal/QuitUserTitle', type: 'STRING', values: { de: 'Mitarbeiteraustritt', en: 'Quit Employee' } },
    { uri: '/Dialogs/signal/reason', type: 'STRING', values: { de: 'Begründung', en: 'Reason' } },
    { uri: '/Dialogs/signal/street', type: 'STRING', values: { de: 'Strasse', en: 'Street' } },
    { uri: '/Dialogs/signal/userKey', type: 'STRING', values: { de: 'Benutzerkennung', en: 'User Key' } },
    { uri: '/Dialogs/trigger', type: 'FOLDER', values: {} },
    { uri: '/Dialogs/trigger/dateOfBirth', type: 'STRING', values: { de: 'Geburtsdatum', en: 'Date Of Birth' } },
    { uri: '/Dialogs/trigger/email', type: 'STRING', values: { de: 'E-Mail', en: 'E-Mail' } },
    { uri: '/Dialogs/trigger/employee', type: 'STRING', values: { de: 'Mitarbeiter', en: 'Employee' } },
    {
      uri: '/Dialogs/trigger/isNotAValidEmailAddress',
      type: 'STRING',
      values: { de: 'E-Mail-Adresse ungültig', en: 'E-mail: Not valid.' }
    },
    { uri: '/Dialogs/trigger/newEmployeeTitle', type: 'STRING', values: { de: 'Neuer Mitarbeiter', en: 'New Employee' } },
    { uri: '/Dialogs/trigger/parkingLotNeeded', type: 'STRING', values: { de: 'Parkplatz benötigt', en: 'Parking Lot needed' } },
    { uri: '/Dialogs/trigger/parkingLotNr', type: 'STRING', values: { de: 'Parkplatznr.', en: 'Parking Lot Nr.' } },
    { uri: '/Dialogs/trigger/selectParkingLot', type: 'STRING', values: { de: 'Parkplatz auswählen', en: 'Select parking lot' } },
    { uri: '/Files', type: 'FOLDER', values: {} },
    { uri: '/Files/TextFile', type: 'FILE', values: { de: 'SW5oYWx0', en: 'Q29udGVudA==' }, meta: { fileExtension: 'txt' } }
  ],
  helpUrl: 'https://dev.axonivy.com'
};
