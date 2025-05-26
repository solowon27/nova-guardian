'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var client_1 = require("@apollo/client");
var navigation_1 = require("next/navigation"); // Keep next/navigation as per original
var react_1 = require("react");
// --- GraphQL Queries and Mutations (UNCHANGED) ---
var queries_1 = require("@/graphql/queries");
var queries_2 = require("@/graphql/queries");
var queries_3 = require("@/graphql/queries");
var mutations_1 = require("@/graphql/mutations");
function ParentDashboard() {
    var _this = this;
    var _a, _b, _c, _d;
    var router = navigation_1.useRouter();
    var _e = react_1.useState(null), selectedChild = _e[0], setSelectedChild = _e[1];
    var _f = react_1.useState(''), title = _f[0], setTitle = _f[1];
    var _g = react_1.useState(''), description = _g[0], setDescription = _g[1];
    var _h = react_1.useState('EASY'), difficulty = _h[0], setDifficulty = _h[1]; // New state for difficulty
    var _j = react_1.useState([]), questions = _j[0], setQuestions = _j[1];
    var _k = react_1.useState({}), feedbackMap = _k[0], setFeedbackMap = _k[1];
    var _l = react_1.useState(false), showAllNotifications = _l[0], setShowAllNotifications = _l[1];
    // --- Data Fetching ---
    var _m = client_1.useQuery(queries_2.GET_CHILDREN), childrenData = _m.data, childrenLoading = _m.loading, childrenError = _m.error;
    var _o = client_1.useQuery(queries_1.GET_PARENT_NOTIFICATIONS, {
        variables: { limit: showAllNotifications ? null : 5 }
    }), inboxData = _o.data, refetchNotifications = _o.refetch;
    var _p = client_1.useQuery(queries_3.GET_ASSIGNMENTS_FOR_CHILD, {
        variables: {
            childId: (selectedChild === null || selectedChild === void 0 ? void 0 : selectedChild.id) || (selectedChild === null || selectedChild === void 0 ? void 0 : selectedChild._id) || ''
        },
        skip: !selectedChild
    }), assignmentsData = _p.data, refetchAssignments = _p.refetch, assignmentsLoading = _p.loading;
    // --- Mutations ---
    var createAssignment = client_1.useMutation(mutations_1.CREATE_ASSIGNMENT)[0];
    var updateFeedback = client_1.useMutation(mutations_1.UPDATE_ASSIGNMENT_FEEDBACK)[0];
    // --- Effects ---
    react_1.useEffect(function () {
        if (selectedChild) {
            refetchAssignments();
        }
    }, [selectedChild, refetchAssignments]);
    // --- Handlers ---
    var handleSelectChild = function (child) {
        setSelectedChild(child);
        setTitle('');
        setDescription('');
        setDifficulty('EASY'); // Reset difficulty on child change
        setQuestions([]);
        setFeedbackMap({}); // Clear feedback map for new child
    };
    var handleAddQuestion = function () {
        setQuestions(__spreadArrays(questions, [{ type: 'EXPLAIN', prompt: '', options: [''], answer: '' }]));
    };
    var handleQuestionChange = function (index, field, value) {
        var updated = __spreadArrays(questions);
        updated[index][field] = value;
        setQuestions(updated);
    };
    var handleOptionChange = function (qIndex, oIndex, value) {
        var updated = __spreadArrays(questions);
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };
    var handleAddOption = function (qIndex) {
        var updated = __spreadArrays(questions);
        updated[qIndex].options.push('');
        setQuestions(updated);
    };
    var handleDeleteQuestion = function (indexToDelete) {
        setQuestions(questions.filter(function (_, i) { return i !== indexToDelete; }));
    };
    var handleDeleteOption = function (qIndex, oIndexToDelete) {
        var updated = __spreadArrays(questions);
        updated[qIndex].options = updated[qIndex].options.filter(function (_, i) { return i !== oIndexToDelete; });
        if (updated[qIndex].options.length === 0 && (updated[qIndex].type === 'MULTIPLE_CHOICE' || updated[qIndex].type === 'TRUE_FALSE')) {
            updated[qIndex].options.push(''); // Ensure at least one empty option remains
        }
        setQuestions(updated);
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var _i, questions_1, q, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!selectedChild) {
                        alert('Please select a child first!');
                        return [2 /*return*/];
                    }
                    if (!title.trim() || !description.trim()) {
                        alert('Please provide a title and description for the assignment.');
                        return [2 /*return*/];
                    }
                    if (questions.length === 0) {
                        alert('Please add at least one question to the assignment.');
                        return [2 /*return*/];
                    }
                    // Basic validation for questions (can be expanded)
                    for (_i = 0, questions_1 = questions; _i < questions_1.length; _i++) {
                        q = questions_1[_i];
                        if (!q.prompt.trim()) {
                            alert('All questions must have a prompt.');
                            return [2 /*return*/];
                        }
                        if ((q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && q.options.some(function (opt) { return !opt.trim(); })) {
                            alert('All options for multiple choice/true-false questions must be filled.');
                            return [2 /*return*/];
                        }
                        if ((q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && q.options.length < 2) {
                            alert('Multiple choice and True/False questions need at least two options.');
                            return [2 /*return*/];
                        }
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, createAssignment({
                            variables: { childId: selectedChild.id, title: title, description: description, questions: questions, difficulty: difficulty }
                        })];
                case 2:
                    _a.sent();
                    alert('🌟 Assignment created successfully!');
                    setTitle('');
                    setDescription('');
                    setDifficulty('EASY');
                    setQuestions([]);
                    refetchAssignments();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error creating assignment:', err_1);
                    alert("Failed to create assignment: " + err_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleFeedbackChange = function (id, value) {
        setFeedbackMap(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[id] = value, _a)));
        });
    };
    var submitFeedback = function (assignmentId) { return __awaiter(_this, void 0, void 0, function () {
        var feedbackText, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    feedbackText = feedbackMap[assignmentId];
                    if (!feedbackText || feedbackText.trim() === '') {
                        alert('Feedback cannot be empty!');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateFeedback({
                            variables: { assignmentId: assignmentId, feedback: feedbackText }
                        })];
                case 2:
                    _a.sent();
                    alert('📝 Feedback submitted!');
                    // Update the local state or refetch to show the submitted feedback
                    refetchAssignments();
                    setFeedbackMap(function (prev) {
                        var newMap = __assign({}, prev);
                        delete newMap[assignmentId]; // Clear the feedback from input after submission
                        return newMap;
                    });
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error submitting feedback:', err_2);
                    alert("Failed to submit feedback: " + err_2.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // --- UI Calculations ---
    var assignmentProgress = (function () {
        var _a;
        if (!((_a = assignmentsData === null || assignmentsData === void 0 ? void 0 : assignmentsData.getAssignmentsForChild) === null || _a === void 0 ? void 0 : _a.length))
            return 0;
        var total = assignmentsData.getAssignmentsForChild.length;
        var completed = assignmentsData.getAssignmentsForChild.filter(function (a) { return a.status === 'COMPLETED'; }).length;
        return Math.round((completed / total) * 100);
    })();
    // --- Loading and Error States ---
    if (childrenLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" },
            React.createElement("div", { className: "text-center p-8 bg-white rounded-lg shadow-xl animate-fade-in" },
                React.createElement("svg", { className: "animate-spin h-12 w-12 text-blue-500 mx-auto mb-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                    React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })),
                React.createElement("p", { className: "text-xl font-semibold text-gray-700" }, "Loading your little learners... \uD83D\uDE80"))));
    }
    if (childrenError) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-screen bg-red-50" },
            React.createElement("div", { className: "p-8 text-center bg-red-100 rounded-xl shadow-lg border border-red-300 animate-fade-in" },
                React.createElement("p", { className: "text-xl font-bold text-red-700 mb-4" }, "\u26A0\uFE0F Error loading children:"),
                React.createElement("p", { className: "text-lg text-red-600" }, childrenError.message),
                React.createElement("button", { onClick: function () { return window.location.reload(); }, className: "mt-6 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 shadow-md" }, "Try Again"))));
    }
    return (React.createElement("div", { className: "min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 to-purple-50 font-sans text-gray-800" },
        React.createElement("aside", { className: "lg:w-1/4 w-full bg-white shadow-2xl p-6 border-r border-gray-100 flex flex-col z-10" },
            React.createElement("h2", { className: "text-4xl font-extrabold text-blue-700 mb-8 text-center leading-tight" },
                React.createElement("span", { className: "block text-blue-500 text-5xl mb-2" }, "\uD83C\uDFE1"),
                "Family Hub"),
            React.createElement("section", { className: "mb-8 flex-grow" },
                React.createElement("h3", { className: "text-2xl font-bold text-gray-800 mb-5 flex items-center" },
                    React.createElement("span", { className: "mr-3 text-blue-500 text-3xl" }, "\uD83D\uDC68\u200D\uD83D\uDC67\u200D\uD83D\uDC66"),
                    " Your Little Learners"),
                ((_a = childrenData === null || childrenData === void 0 ? void 0 : childrenData.getMyChildren) === null || _a === void 0 ? void 0 : _a.length) === 0 ? (React.createElement("div", { className: "text-gray-500 italic p-4 bg-blue-50 rounded-xl text-center border border-blue-200 shadow-sm" },
                    React.createElement("p", { className: "mb-2" }, "No children added yet."),
                    React.createElement("button", { onClick: function () { return router.push('/parent/add-child'); }, className: "inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 shadow-md transform hover:-translate-y-0.5 text-sm" },
                        React.createElement("span", { className: "mr-1" }, "\u2795"),
                        " Add Child"))) : (React.createElement("ul", { className: "space-y-4" }, childrenData.getMyChildren.map(function (child) { return (React.createElement("li", { key: child.id, className: "p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center " + ((selectedChild === null || selectedChild === void 0 ? void 0 : selectedChild.id) === child.id ? 'bg-blue-600 text-white shadow-xl border border-blue-700' : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-150'), onClick: function () { return handleSelectChild(child); } },
                    React.createElement("div", { className: "w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 " + ((selectedChild === null || selectedChild === void 0 ? void 0 : selectedChild.id) === child.id ? 'bg-blue-300' : 'bg-blue-400') }, child.name.charAt(0).toUpperCase()),
                    React.createElement("div", null,
                        React.createElement("div", { className: "font-extrabold text-xl" }, child.name),
                        React.createElement("div", { className: ((selectedChild === null || selectedChild === void 0 ? void 0 : selectedChild.id) === child.id ? 'text-blue-200' : 'text-blue-600') + " text-sm" },
                            "Age ",
                            child.age)))); }))),
                React.createElement("button", { onClick: function () { return router.push('/parent/add-child'); }, className: "mt-6 w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300 shadow-lg transform hover:-translate-y-1 flex items-center justify-center" },
                    React.createElement("span", { className: "text-xl mr-2" }, "\u2728"),
                    " Add New Child")),
            React.createElement("section", { className: "bg-white p-6 shadow-xl rounded-xl border border-gray-100" },
                React.createElement("h3", { className: "text-2xl font-bold text-gray-800 mb-5 flex items-center" },
                    React.createElement("span", { className: "mr-3 text-purple-500 text-3xl" }, "\uD83D\uDC8C"),
                    " Notifications"),
                !((_b = inboxData === null || inboxData === void 0 ? void 0 : inboxData.getParentNotifications) === null || _b === void 0 ? void 0 : _b.length) ? (React.createElement("p", { className: "text-gray-500 italic p-3 bg-purple-50 rounded-lg text-center border border-purple-200 shadow-sm" }, "No new updates from your kids yet.")) : (React.createElement(React.Fragment, null,
                    React.createElement("ul", { className: "space-y-3 text-sm text-gray-700 max-h-60 overflow-y-auto custom-scrollbar pr-2" }, inboxData.getParentNotifications.map(function (log, idx) {
                        var date = log.date instanceof Date ? log.date : new Date(log.date);
                        return (React.createElement("li", { key: idx, className: "pb-3 border-b border-gray-100 last:border-b-0" },
                            React.createElement("span", { className: "font-medium text-gray-900 flex items-start" },
                                React.createElement("span", { className: "text-xl mr-2 text-blue-400 flex-shrink-0" }, "\uD83D\uDD14"),
                                " ",
                                React.createElement("span", { className: "flex-grow" }, log.message)),
                            React.createElement("span", { className: "block text-xs text-gray-500 mt-1 pl-7" }, isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString())));
                    })),
                    React.createElement("div", { className: "text-center mt-4" },
                        React.createElement("button", { onClick: function () { return setShowAllNotifications(!showAllNotifications); }, className: "text-blue-600 text-sm font-semibold hover:underline transition-colors duration-200" }, showAllNotifications ? '▲ Show Less' : '▼ View More')))))),
        React.createElement("main", { className: "flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar" },
            React.createElement("header", { className: "flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-xl border border-blue-100 sticky top-0 z-10" },
                React.createElement("h1", { className: "text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 sm:mb-0" }, "Parent Dashboard"),
                selectedChild && (React.createElement("div", { className: "flex items-center space-x-4" },
                    React.createElement("span", { className: "text-xl font-bold text-indigo-700" },
                        selectedChild.name,
                        "'s Progress:"),
                    React.createElement("div", { className: "w-40 bg-gray-200 rounded-full h-5 relative overflow-hidden shadow-inner" },
                        React.createElement("div", { className: "bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2", style: { width: assignmentProgress + "%" } },
                            React.createElement("span", { className: "text-xs font-bold text-white text-shadow-sm" },
                                assignmentProgress,
                                "%")))))),
            !selectedChild && (React.createElement("div", { className: "bg-blue-100 p-10 rounded-2xl shadow-2xl text-center border-2 border-blue-300 animate-fade-in-up" },
                React.createElement("p", { className: "text-3xl font-extrabold text-blue-800 mb-4" }, "\uD83D\uDC4B Welcome to Your NovaGuardian Dashboard!"),
                React.createElement("p", { className: "text-lg text-blue-700 mb-6" }, "Let's get started. Select a child from the left sidebar to dive into their assignments, or create new learning adventures."),
                React.createElement("button", { onClick: function () {
                        var _a;
                        // Optionally auto-select the first child if available
                        if (((_a = childrenData === null || childrenData === void 0 ? void 0 : childrenData.getMyChildren) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                            handleSelectChild(childrenData.getMyChildren[0]);
                        }
                        else {
                            router.push('/parent/add-child');
                        }
                    }, className: "mt-6 px-10 py-5 bg-purple-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto" },
                    ((_c = childrenData === null || childrenData === void 0 ? void 0 : childrenData.getMyChildren) === null || _c === void 0 ? void 0 : _c.length) > 0 ? 'View First Child\'s Profile' : 'Add Your First Child!',
                    React.createElement("span", { className: "ml-3 text-2xl" }, "\u27A1\uFE0F")))),
            selectedChild && (React.createElement(React.Fragment, null,
                React.createElement("section", { className: "bg-white p-8 rounded-2xl shadow-xl border border-blue-100 animate-fade-in" },
                    React.createElement("h2", { className: "text-3xl font-bold text-indigo-700 mb-8 flex items-center" },
                        React.createElement("span", { className: "mr-3 text-purple-500 text-4xl" }, "\u270D\uFE0F"),
                        " Create New Assignment for ",
                        React.createElement("span", { className: "text-blue-600 ml-2" }, selectedChild.name)),
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", null,
                            React.createElement("label", { htmlFor: "assignmentTitle", className: "block text-lg font-semibold text-gray-700 mb-2" }, "Title"),
                            React.createElement("input", { id: "assignmentTitle", type: "text", placeholder: "e.g., Math Homework: Addition & Subtraction", value: title, onChange: function (e) { return setTitle(e.target.value); }, className: "w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm", required: true })),
                        React.createElement("div", null,
                            React.createElement("label", { htmlFor: "assignmentDescription", className: "block text-lg font-semibold text-gray-700 mb-2" }, "Description"),
                            React.createElement("textarea", { id: "assignmentDescription", placeholder: "Explain what the assignment covers and its purpose.", value: description, onChange: function (e) { return setDescription(e.target.value); }, className: "w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm", rows: 4, required: true })),
                        React.createElement("div", null,
                            React.createElement("label", { htmlFor: "difficulty", className: "block text-lg font-semibold text-gray-700 mb-2" }, "Difficulty"),
                            React.createElement("select", { id: "difficulty", value: difficulty, onChange: function (e) { return setDifficulty(e.target.value); }, className: "w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 bg-white shadow-sm appearance-none" },
                                React.createElement("option", { value: "EASY" }, "Easy (\uD83D\uDFE2)"),
                                React.createElement("option", { value: "MEDIUM" }, "Medium (\uD83D\uDFE1)"),
                                React.createElement("option", { value: "HARD" }, "Hard (\uD83D\uDD34)"))),
                        React.createElement("div", { className: "space-y-6" },
                            React.createElement("h3", { className: "text-2xl font-bold text-gray-700 mt-8" }, "Questions:"),
                            questions.map(function (q, index) { return (React.createElement("div", { key: index, className: "p-7 border border-blue-200 rounded-2xl bg-blue-50 space-y-4 shadow-md relative group" },
                                React.createElement("button", { type: "button", onClick: function () { return handleDeleteQuestion(index); }, className: "absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors duration-200 text-3xl opacity-70 hover:opacity-100", title: "Delete Question" }, "\u00D7"),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block text-md font-semibold text-gray-700 mb-1" }, "Question Type"),
                                    React.createElement("select", { value: q.type, onChange: function (e) { return handleQuestionChange(index, 'type', e.target.value); }, className: "border border-gray-300 rounded-lg p-2 bg-white focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 appearance-none" },
                                        React.createElement("option", { value: "EXPLAIN" }, "Explain"),
                                        React.createElement("option", { value: "SHORT_ANSWER" }, "Short Answer"),
                                        React.createElement("option", { value: "MULTIPLE_CHOICE" }, "Multiple Choice"),
                                        React.createElement("option", { value: "TRUE_FALSE" }, "True/False"))),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block text-md font-semibold text-gray-700 mb-1" }, "Prompt"),
                                    React.createElement("input", { type: "text", placeholder: "e.g., What is the capital of France?", value: q.prompt, onChange: function (e) { return handleQuestionChange(index, 'prompt', e.target.value); }, className: "w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm", required: true })),
                                (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && (React.createElement("div", { className: "space-y-3 p-4 bg-white rounded-xl border border-gray-200 shadow-inner" },
                                    React.createElement("h4", { className: "text-lg font-bold text-gray-700 mb-2" }, "Options:"),
                                    q.options.map(function (opt, oIdx) { return (React.createElement("div", { key: oIdx, className: "flex items-center gap-2" },
                                        React.createElement("input", { type: "text", placeholder: "Option " + (oIdx + 1), value: opt, onChange: function (e) { return handleOptionChange(index, oIdx, e.target.value); }, className: "flex-grow border border-gray-300 rounded-lg p-2 text-base focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 shadow-sm", required: true }),
                                        q.options.length > 1 && (React.createElement("button", { type: "button", onClick: function () { return handleDeleteOption(index, oIdx); }, className: "text-red-500 hover:text-red-700 text-xl transition-colors duration-200 opacity-80 hover:opacity-100", title: "Delete Option" }, "\u00D7")))); }),
                                    React.createElement("button", { type: "button", onClick: function () { return handleAddOption(index); }, className: "text-blue-600 font-medium text-sm hover:underline transition-colors duration-200 mt-2 flex items-center justify-center px-3 py-1 bg-blue-100 rounded-full hover:bg-blue-200" },
                                        React.createElement("span", { className: "text-lg mr-1" }, "\u2795"),
                                        " Add Option"))),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block text-md font-semibold text-gray-700 mb-1" }, "Correct Answer (Optional, for auto-grading/reference)"),
                                    React.createElement("input", { type: "text", placeholder: "e.g., Paris", value: q.answer, onChange: function (e) { return handleQuestionChange(index, 'answer', e.target.value); }, className: "w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm" })))); }),
                            React.createElement("button", { type: "button", onClick: handleAddQuestion, className: "w-full py-3 px-6 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-300 shadow-md flex items-center justify-center transform hover:-translate-y-1" },
                                React.createElement("span", { className: "text-xl mr-2" }, "\u2795"),
                                " Add New Question")),
                        React.createElement("button", { type: "submit", className: "w-full py-4 bg-purple-600 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-[1.01]" },
                            React.createElement("span", { className: "mr-2 text-2xl" }, "\uD83D\uDE80"),
                            " Create Assignment"))),
                React.createElement("section", { className: "bg-white p-8 rounded-2xl shadow-xl border border-blue-100 animate-fade-in" },
                    React.createElement("h2", { className: "text-3xl font-bold text-indigo-700 mb-8 flex items-center" },
                        React.createElement("span", { className: "mr-3 text-green-500 text-4xl" }, "\u2705"),
                        " Assignments for ",
                        React.createElement("span", { className: "text-blue-600 ml-2" }, selectedChild.name)),
                    assignmentsLoading ? (React.createElement("div", { className: "flex items-center justify-center p-8 bg-gray-50 rounded-xl shadow-inner" },
                        React.createElement("svg", { className: "animate-spin h-8 w-8 text-gray-400 mr-3", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                            React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                            React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })),
                        React.createElement("p", { className: "text-center text-gray-500 italic text-lg" }, "Loading assignments..."))) : ((_d = assignmentsData === null || assignmentsData === void 0 ? void 0 : assignmentsData.getAssignmentsForChild) === null || _d === void 0 ? void 0 : _d.length) === 0 ? (React.createElement("p", { className: "text-gray-500 italic text-lg text-center p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm" },
                        "No assignments created for ",
                        selectedChild.name,
                        " yet. Time to create some!")) : (React.createElement("div", { className: "space-y-6" }, assignmentsData.getAssignmentsForChild.map(function (assignment) {
                        var _a, _b;
                        var statusColor = {
                            'COMPLETED': 'bg-green-100 text-green-800 border-green-300',
                            'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                            'NEW': 'bg-blue-100 text-blue-800 border-blue-300'
                        }[assignment.status] || 'bg-gray-100 text-gray-800 border-gray-300';
                        var difficultyColors = {
                            EASY: 'text-green-600 font-extrabold',
                            MEDIUM: 'text-yellow-600 font-extrabold',
                            HARD: 'text-red-600 font-extrabold'
                        };
                        return (React.createElement("div", { key: assignment.id, className: "p-7 border rounded-2xl shadow-md bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" },
                            React.createElement("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4" },
                                React.createElement("div", null,
                                    React.createElement("h3", { className: "font-extrabold text-2xl text-blue-800 mb-1" }, assignment.title),
                                    React.createElement("p", { className: "text-sm " + (difficultyColors[assignment.difficulty] || 'text-gray-600') },
                                        "Difficulty: ",
                                        assignment.difficulty || 'N/A')),
                                React.createElement("span", { className: "mt-2 sm:mt-0 px-4 py-1.5 rounded-full text-sm font-semibold border " + statusColor }, assignment.status.replace('_', ' '))),
                            React.createElement("p", { className: "text-gray-700 mb-5 text-base leading-relaxed" }, assignment.description),
                            React.createElement("div", { className: "space-y-4 border-t pt-5 mt-5 border-gray-100" },
                                React.createElement("h4", { className: "text-lg font-bold text-gray-700" }, "Questions & Responses:"),
                                assignment.questions.map(function (q, qIndex) {
                                    var response = assignment.responses.find(function (r) { return r.questionIndex === qIndex; });
                                    var answerText = response ? response.answer : 'No response submitted yet.';
                                    var isCorrectAnswer = q.answer && answerText.toLowerCase() === q.answer.toLowerCase() && answerText.trim() !== '';
                                    return (React.createElement("div", { key: qIndex, className: "p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-inner" },
                                        React.createElement("p", { className: "text-md font-semibold text-gray-800 mb-2" },
                                            React.createElement("span", { className: "text-blue-500 mr-1" },
                                                "Q",
                                                qIndex + 1,
                                                ":"),
                                            " ",
                                            q.prompt),
                                        q.options && q.options.length > 0 && (React.createElement("ul", { className: "list-disc list-inside text-sm text-gray-600 mb-2 ml-4" }, q.options.map(function (opt, i) { return (React.createElement("li", { key: i }, opt)); }))),
                                        React.createElement("p", { className: "text-sm font-medium " + (response ? (isCorrectAnswer ? 'text-green-700' : 'text-red-700') : 'text-gray-600') },
                                            "Your Child's Answer: ",
                                            React.createElement("span", { className: "font-normal" }, answerText),
                                            q.answer && q.answer.trim() !== '' && (React.createElement("span", { className: "block text-gray-500 italic mt-1" },
                                                "Expected: ",
                                                q.answer)))));
                                })),
                            assignment.status === 'COMPLETED' && (React.createElement("div", { className: "mt-6 p-5 bg-blue-50 rounded-xl border border-blue-200 shadow-inner" },
                                React.createElement("h4", { className: "text-lg font-bold text-blue-700 mb-3 flex items-center" },
                                    React.createElement("span", { className: "text-xl mr-2" }, "\uD83C\uDF1F"),
                                    " Give Feedback:"),
                                React.createElement("textarea", { rows: 3, className: "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 shadow-sm", placeholder: "Write your feedback for your child's performance (e.g., 'Great effort!', 'Try reviewing fractions.')...", value: (_b = (_a = feedbackMap[assignment.id]) !== null && _a !== void 0 ? _a : assignment.feedback) !== null && _b !== void 0 ? _b : '', onChange: function (e) { return handleFeedbackChange(assignment.id, e.target.value); } }),
                                React.createElement("button", { onClick: function () { return submitFeedback(assignment.id); }, className: "mt-4 px-6 py-2.5 text-md bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md transform hover:-translate-y-0.5 flex items-center" },
                                    React.createElement("span", { className: "mr-2" }, "\uD83D\uDCAC"),
                                    " Submit Feedback"),
                                assignment.feedback && (React.createElement("div", { className: "mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200" },
                                    React.createElement("p", { className: "text-sm text-gray-700 italic font-medium" }, "Your Last Feedback:"),
                                    React.createElement("p", { className: "text-base text-gray-800" }, assignment.feedback)))))));
                    })))))))));
}
exports["default"] = ParentDashboard;
