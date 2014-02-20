class UsersController < ApplicationController
  def create
    @user = User.new(user_params)
    if @user.save then
      current_user_session.destroy if current_user_session
      UserSession.create(:login => @user.login, :password => @user.password)
      render :nothing => true, :status => 200
    else
      render :json => @user.errors, :status => 403
    end
  end

  def show
    require_user
  end

  private

  def user_params
    params.require(:user).permit(:login, :email, :password, :password_confirmation)
  end
end
