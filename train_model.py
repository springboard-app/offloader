import sys
from joblib import dump, load
import numpy as np

from sklearn.neural_network import MLPClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.gaussian_process import GaussianProcessClassifier
from sklearn.gaussian_process.kernels import RBF
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.discriminant_analysis import QuadraticDiscriminantAnalysis

from sklearn.ensemble import RandomForestRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor

from sklearn.model_selection import train_test_split

id = sys.argv[1]
tt_percentage = float(sys.argv[2])
ml_type = sys.argv[3]

data = np.genfromtxt("data_matrix.csv",delimiter=',',dtype="float")

print(data)

y = data[:,0]
X = data[:,1:]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=float(tt_percentage), random_state=42)

if ml_type == "Support Vector Classifier":
    ml_type = "SVC"
elif ml_type == "Neural Network Classifier":
    ml_type = "MLPClassifier"
elif ml_type == "Naive Bayes":
    ml_type = "GaussianNB"
elif ml_type == "Support Vector Regressor":
    ml_type = "SVR"
else:
    ml_type = ml_type.replace(" ","")
print(ml_type)

ml_str = ml_type + "()"
ml = eval(ml_str)
ml.fit(X_train,y_train)

if X_test is not None and y_test is not None:
    print(ml.score(X_test,y_test))

dump(ml, str(id) + '.joblib')